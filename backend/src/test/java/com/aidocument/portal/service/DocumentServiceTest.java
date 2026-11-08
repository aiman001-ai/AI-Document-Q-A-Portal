package com.aidocument.portal.service;

import com.aidocument.portal.dto.DocumentResponse;
import com.aidocument.portal.entity.Document;
import com.aidocument.portal.entity.DocumentChunk;
import com.aidocument.portal.entity.Role;
import com.aidocument.portal.entity.User;
import com.aidocument.portal.repository.ChatMessageRepository;
import com.aidocument.portal.repository.DocumentChunkRepository;
import com.aidocument.portal.repository.DocumentRepository;
import com.aidocument.portal.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private DocumentChunkRepository documentChunkRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PdfParserService pdfParserService;

    @Mock
    private RagService ragService;

    @InjectMocks
    private DocumentService documentService;

    @TempDir
    Path tempDir;

    private User user;
    private Document document;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(documentService, "uploadDir", tempDir.toString());
        user = new User("alice", "alice@example.com", "pass", Role.ROLE_USER);
        user.setId(1L);

        document = new Document("passport", "passport.pdf", "application/pdf", 1024L, 2, tempDir.resolve("passport.pdf").toString(), user);
        document.setId(100L);
    }

    @Test
    @DisplayName("UploadDocument: Should extract text, chunk and save PDF")
    void testUploadDocumentSuccess() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "passport.pdf",
                "application/pdf",
                "%PDF-1.4 mock content".getBytes()
        );

        PdfParserService.PdfExtractionResult extraction = new PdfParserService.PdfExtractionResult(
                1,
                Map.of(1, "Passport Holder: Alice Doe, Country: India"),
                "Passport Holder: Alice Doe, Country: India"
        );

        DocumentChunk chunk = new DocumentChunk(document, 0, 1, "Passport Holder: Alice Doe, Country: India");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(pdfParserService.extractTextFromPdf(any(File.class))).thenReturn(extraction);
        when(documentRepository.save(any(Document.class))).thenReturn(document);
        when(ragService.createChunks(any(Document.class), anyMap())).thenReturn(List.of(chunk));
        when(documentChunkRepository.saveAll(anyList())).thenReturn(List.of(chunk));

        DocumentResponse response = documentService.uploadDocument(file, 1L);

        assertNotNull(response);
        assertEquals("passport", response.getTitle());
        verify(documentRepository, atLeastOnce()).save(any(Document.class));
        verify(documentChunkRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("GetUserDocuments: Should return all documents belonging to user")
    void testGetUserDocuments() {
        when(documentRepository.findByUserIdOrderByUploadTimeDesc(1L)).thenReturn(List.of(document));
        when(documentChunkRepository.findByDocumentId(100L)).thenReturn(Collections.emptyList());

        List<DocumentResponse> list = documentService.getUserDocuments(1L);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("passport", list.get(0).getTitle());
    }
}


package com.aidocument.portal.service;

import com.aidocument.portal.dto.CitationDto;
import com.aidocument.portal.entity.Document;
import com.aidocument.portal.entity.DocumentChunk;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class RagServiceTest {

    private RagService ragService;

    @BeforeEach
    void setUp() {
        ragService = new RagService();
        ReflectionTestUtils.setField(ragService, "defaultChunkSize", 100);
        ReflectionTestUtils.setField(ragService, "defaultChunkOverlap", 20);
    }

    @Test
    @DisplayName("Should create chunks respecting chunk size and overlap")
    void testCreateChunks() {
        Document doc = new Document();
        String sampleText = "The customer identity verification process requires Aadhaar card, PAN card, and address proof. All documents must be signed.";

        List<DocumentChunk> chunks = ragService.createChunks(doc, Map.of(1, sampleText), 50, 10);

        assertNotNull(chunks);
        assertTrue(chunks.size() >= 2);
        assertEquals(1, chunks.get(0).getPageNumber());
        assertFalse(chunks.get(0).getContent().isEmpty());
    }

    @Test
    @DisplayName("Should retrieve top relevant chunks based on query keywords")
    void testRetrieveTopChunks() {
        Document doc = new Document();
        DocumentChunk c1 = new DocumentChunk(doc, 0, 1, "The total invoice amount is USD 5,400 due on December 15.");
        DocumentChunk c2 = new DocumentChunk(doc, 1, 1, "The contractor agrees to provide software maintenance services.");
        DocumentChunk c3 = new DocumentChunk(doc, 2, 2, "Payment should be wired directly to the designated bank account.");

        List<CitationDto> results = ragService.retrieveTopChunks(List.of(c1, c2, c3), "What is the invoice amount?", 2);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertEquals(0, results.get(0).getChunkIndex());
        assertTrue(results.get(0).getSnippet().contains("5,400"));
    }
}


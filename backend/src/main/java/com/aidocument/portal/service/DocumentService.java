package com.aidocument.portal.service;

import com.aidocument.portal.dto.DocumentChunkResponse;
import com.aidocument.portal.dto.DocumentResponse;
import com.aidocument.portal.entity.Document;
import com.aidocument.portal.entity.DocumentChunk;
import com.aidocument.portal.entity.User;
import com.aidocument.portal.repository.ChatMessageRepository;
import com.aidocument.portal.repository.DocumentChunkRepository;
import com.aidocument.portal.repository.DocumentRepository;
import com.aidocument.portal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final PdfParserService pdfParserService;
    private final RagService ragService;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentChunkRepository documentChunkRepository,
                           ChatMessageRepository chatMessageRepository,
                           UserRepository userRepository,
                           PdfParserService pdfParserService,
                           RagService ragService) {
        this.documentRepository = documentRepository;
        this.documentChunkRepository = documentChunkRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.pdfParserService = pdfParserService;
        this.ragService = ragService;
    }

    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file, Long userId) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF files are supported");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        // Create upload directory if needed
        Path storageDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(storageDirectory);

        String storedFilename = UUID.randomUUID() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path targetLocation = storageDirectory.resolve(storedFilename);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Parse PDF content and extract pages
        File savedFile = targetLocation.toFile();
        PdfParserService.PdfExtractionResult extractionResult = pdfParserService.extractTextFromPdf(savedFile);

        String documentTitle = originalFilename.replaceFirst("[.][^.]+$", "");
        Document document = new Document(
                documentTitle,
                originalFilename,
                file.getContentType() != null ? file.getContentType() : "application/pdf",
                file.getSize(),
                extractionResult.pageCount(),
                targetLocation.toString(),
                user
        );

        // Save document initially
        Document savedDocument = documentRepository.save(document);

        // Chunk text & save chunks
        List<DocumentChunk> chunks = ragService.createChunks(savedDocument, extractionResult.pageTexts());
        documentChunkRepository.saveAll(chunks);

        // Quick automatic summary
        String initialSummary = generateInitialSummary(extractionResult.fullText());
        savedDocument.setSummary(initialSummary);
        savedDocument = documentRepository.save(savedDocument);

        logger.info("Uploaded and indexed document '{}' with {} pages and {} chunks",
                originalFilename, extractionResult.pageCount(), chunks.size());

        return mapToResponse(savedDocument, chunks.size());
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getUserDocuments(Long userId) {
        return documentRepository.findByUserIdOrderByUploadTimeDesc(userId).stream()
                .map(doc -> {
                    int chunkCount = documentChunkRepository.findByDocumentId(doc.getId()).size();
                    return mapToResponse(doc, chunkCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(Long documentId, Long userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with id: " + documentId));
        int chunkCount = documentChunkRepository.findByDocumentId(document.getId()).size();
        return mapToResponse(document, chunkCount);
    }

    @Transactional(readOnly = true)
    public List<DocumentChunkResponse> getDocumentChunks(Long documentId, Long userId) {
        // Verify ownership
        documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found or unauthorized"));

        return documentChunkRepository.findByDocumentIdOrderByChunkIndexAsc(documentId).stream()
                .map(c -> new DocumentChunkResponse(c.getId(), c.getChunkIndex(), c.getPageNumber(), c.getContent(), c.getCharacterCount()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public File getDocumentFile(Long documentId, Long userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found or access denied"));

        File file = new File(document.getStoragePath());
        if (!file.exists()) {
            throw new IllegalStateException("Document file not found on disk");
        }
        return file;
    }

    @Transactional
    public void deleteDocument(Long documentId, Long userId) {
        Document document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found with id: " + documentId));

        // Delete from disk
        try {
            Path filePath = Paths.get(document.getStoragePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            logger.warn("Could not delete file {}: {}", document.getStoragePath(), e.getMessage());
        }

        // Delete associated chunks and messages
        chatMessageRepository.deleteByDocumentId(documentId);
        documentChunkRepository.deleteByDocumentId(documentId);
        documentRepository.delete(document);

        logger.info("Deleted document id {} for user id {}", documentId, userId);
    }

    private String generateInitialSummary(String fullText) {
        if (fullText == null || fullText.isBlank()) {
            return "No readable text could be extracted from this PDF.";
        }
        String cleaned = fullText.replaceAll("\\s+", " ").trim();
        if (cleaned.length() <= 280) {
            return cleaned;
        }
        return cleaned.substring(0, 280) + "...";
    }

    private DocumentResponse mapToResponse(Document document, int chunkCount) {
        return new DocumentResponse(
                document.getId(),
                document.getTitle(),
                document.getOriginalFilename(),
                document.getContentType(),
                document.getFileSize(),
                document.getPageCount(),
                chunkCount,
                document.getSummary(),
                document.getStatus(),
                document.getUploadTime()
        );
    }
}


package com.aidocument.portal.controller;

import com.aidocument.portal.dto.ApiResponse;
import com.aidocument.portal.dto.DocumentChunkResponse;
import com.aidocument.portal.dto.DocumentResponse;
import com.aidocument.portal.security.UserPrincipal;
import com.aidocument.portal.service.DocumentService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) throws IOException {
        DocumentResponse response = documentService.uploadDocument(file, userPrincipal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getUserDocuments(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<DocumentResponse> documents = documentService.getUserDocuments(userPrincipal.getId());
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentResponse> getDocumentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        DocumentResponse document = documentService.getDocumentById(id, userPrincipal.getId());
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}/chunks")
    public ResponseEntity<List<DocumentChunkResponse>> getDocumentChunks(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<DocumentChunkResponse> chunks = documentService.getDocumentChunks(id, userPrincipal.getId());
        return ResponseEntity.ok(chunks);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        File file = documentService.getDocumentFile(id, userPrincipal.getId());
        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        documentService.deleteDocument(id, userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Document deleted successfully"));
    }
}


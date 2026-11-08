package com.aidocument.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatRequest {

    @NotNull(message = "Document ID is required")
    private Long documentId;

    @NotBlank(message = "Question cannot be empty")
    private String question;

    public ChatRequest() {
    }

    public ChatRequest(Long documentId, String question) {
        this.documentId = documentId;
        this.question = question;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}


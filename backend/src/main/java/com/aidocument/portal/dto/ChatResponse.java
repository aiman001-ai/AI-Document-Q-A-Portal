package com.aidocument.portal.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ChatResponse {

    private Long id;
    private Long documentId;
    private String question;
    private String answer;
    private List<CitationDto> citations = new ArrayList<>();
    private LocalDateTime timestamp = LocalDateTime.now();

    public ChatResponse() {
    }

    public ChatResponse(Long id, Long documentId, String question, String answer, List<CitationDto> citations) {
        this.id = id;
        this.documentId = documentId;
        this.question = question;
        this.answer = answer;
        this.citations = citations != null ? citations : new ArrayList<>();
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<CitationDto> getCitations() {
        return citations;
    }

    public void setCitations(List<CitationDto> citations) {
        this.citations = citations;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}


package com.aidocument.portal.dto;

public class DocumentChunkResponse {

    private Long id;
    private Integer chunkIndex;
    private Integer pageNumber;
    private String content;
    private Integer characterCount;

    public DocumentChunkResponse() {
    }

    public DocumentChunkResponse(Long id, Integer chunkIndex, Integer pageNumber, String content, Integer characterCount) {
        this.id = id;
        this.chunkIndex = chunkIndex;
        this.pageNumber = pageNumber;
        this.content = content;
        this.characterCount = characterCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getChunkIndex() {
        return chunkIndex;
    }

    public void setChunkIndex(Integer chunkIndex) {
        this.chunkIndex = chunkIndex;
    }

    public Integer getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(Integer pageNumber) {
        this.pageNumber = pageNumber;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getCharacterCount() {
        return characterCount;
    }

    public void setCharacterCount(Integer characterCount) {
        this.characterCount = characterCount;
    }
}


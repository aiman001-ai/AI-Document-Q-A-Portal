package com.aidocument.portal.dto;

public class CitationDto {

    private Integer chunkIndex;
    private Integer pageNumber;
    private String snippet;
    private Double score;

    public CitationDto() {
    }

    public CitationDto(Integer chunkIndex, Integer pageNumber, String snippet, Double score) {
        this.chunkIndex = chunkIndex;
        this.pageNumber = pageNumber;
        this.snippet = snippet;
        this.score = score;
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

    public String getSnippet() {
        return snippet;
    }

    public void setSnippet(String snippet) {
        this.snippet = snippet;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }
}


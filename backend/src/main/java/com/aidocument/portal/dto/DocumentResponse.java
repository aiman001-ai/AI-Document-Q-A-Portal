package com.aidocument.portal.dto;

import java.time.LocalDateTime;

public class DocumentResponse {

    private Long id;
    private String title;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private Integer pageCount;
    private Integer chunkCount;
    private String summary;
    private String status;
    private LocalDateTime uploadTime;

    public DocumentResponse() {
    }

    public DocumentResponse(Long id, String title, String originalFilename, String contentType,
                            Long fileSize, Integer pageCount, Integer chunkCount,
                            String summary, String status, LocalDateTime uploadTime) {
        this.id = id;
        this.title = title;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.pageCount = pageCount;
        this.chunkCount = chunkCount;
        this.summary = summary;
        this.status = status;
        this.uploadTime = uploadTime;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Integer getPageCount() {
        return pageCount;
    }

    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }

    public Integer getChunkCount() {
        return chunkCount;
    }

    public void setChunkCount(Integer chunkCount) {
        this.chunkCount = chunkCount;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getUploadTime() {
        return uploadTime;
    }

    public void setUploadTime(LocalDateTime uploadTime) {
        this.uploadTime = uploadTime;
    }
}


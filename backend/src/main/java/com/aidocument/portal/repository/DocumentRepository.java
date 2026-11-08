package com.aidocument.portal.repository;

import com.aidocument.portal.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByUserIdOrderByUploadTimeDesc(Long userId);
    Optional<Document> findByIdAndUserId(Long id, Long userId);
}


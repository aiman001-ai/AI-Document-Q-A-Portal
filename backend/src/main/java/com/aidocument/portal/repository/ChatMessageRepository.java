package com.aidocument.portal.repository;

import com.aidocument.portal.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByDocumentIdOrderByTimestampAsc(Long documentId);
    void deleteByDocumentId(Long documentId);
}


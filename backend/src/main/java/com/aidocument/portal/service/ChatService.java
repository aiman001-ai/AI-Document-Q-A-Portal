package com.aidocument.portal.service;

import com.aidocument.portal.dto.ChatRequest;
import com.aidocument.portal.dto.ChatResponse;
import com.aidocument.portal.dto.CitationDto;
import com.aidocument.portal.entity.ChatMessage;
import com.aidocument.portal.entity.Document;
import com.aidocument.portal.entity.DocumentChunk;
import com.aidocument.portal.entity.User;
import com.aidocument.portal.repository.ChatMessageRepository;
import com.aidocument.portal.repository.DocumentChunkRepository;
import com.aidocument.portal.repository.DocumentRepository;
import com.aidocument.portal.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger logger = LoggerFactory.getLogger(ChatService.class);

    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final RagService ragService;
    private final LlmClientService llmClientService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ai.top-k-chunks:4}")
    private int topKChunks;

    public ChatService(DocumentRepository documentRepository,
                       DocumentChunkRepository documentChunkRepository,
                       ChatMessageRepository chatMessageRepository,
                       UserRepository userRepository,
                       RagService ragService,
                       LlmClientService llmClientService) {
        this.documentRepository = documentRepository;
        this.documentChunkRepository = documentChunkRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.ragService = ragService;
        this.llmClientService = llmClientService;
    }

    @Transactional
    public ChatResponse askQuestion(ChatRequest request, Long userId) {
        Document document = documentRepository.findByIdAndUserId(request.getDocumentId(), userId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found or unauthorized"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<DocumentChunk> chunks = documentChunkRepository.findByDocumentId(document.getId());
        if (chunks.isEmpty()) {
            throw new IllegalStateException("Document has no indexed text chunks. Please upload a readable PDF.");
        }

        // 1. Vector / Keyword RAG retrieval
        List<CitationDto> topCitations = ragService.retrieveTopChunks(chunks, request.getQuestion(), topKChunks);

        // 2. Synthesize or generate answer
        String answer = llmClientService.generateAnswer(request.getQuestion(), topCitations, document.getTitle());

        // 3. Serialize citations
        String citationsJson = "[]";
        try {
            citationsJson = objectMapper.writeValueAsString(topCitations);
        } catch (Exception e) {
            logger.warn("Could not serialize citations: {}", e.getMessage());
        }

        // 4. Save User Question message
        ChatMessage userMsg = new ChatMessage(document, user, "USER", request.getQuestion(), null);
        chatMessageRepository.save(userMsg);

        // 5. Save AI Answer message
        ChatMessage aiMsg = new ChatMessage(document, user, "AI", answer, citationsJson);
        ChatMessage savedAiMsg = chatMessageRepository.save(aiMsg);

        return new ChatResponse(
                savedAiMsg.getId(),
                document.getId(),
                request.getQuestion(),
                answer,
                topCitations
        );
    }

    @Transactional(readOnly = true)
    public List<ChatResponse> getChatHistory(Long documentId, Long userId) {
        documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found or unauthorized"));

        List<ChatMessage> messages = chatMessageRepository.findByDocumentIdOrderByTimestampAsc(documentId);
        List<ChatResponse> history = new ArrayList<>();

        for (int i = 0; i < messages.size(); i++) {
            ChatMessage msg = messages.get(i);
            if ("USER".equalsIgnoreCase(msg.getSender())) {
                String question = msg.getMessage();
                String answer = "";
                List<CitationDto> citations = new ArrayList<>();

                // Match with subsequent AI answer if present
                if (i + 1 < messages.size() && "AI".equalsIgnoreCase(messages.get(i + 1).getSender())) {
                    ChatMessage aiMsg = messages.get(i + 1);
                    answer = aiMsg.getMessage();
                    citations = parseCitations(aiMsg.getCitationsJson());
                    i++; // skip next as it is paired
                }

                ChatResponse resp = new ChatResponse(msg.getId(), documentId, question, answer, citations);
                resp.setTimestamp(msg.getTimestamp());
                history.add(resp);
            }
        }

        return history;
    }

    @Transactional
    public void clearChatHistory(Long documentId, Long userId) {
        documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found or unauthorized"));

        chatMessageRepository.deleteByDocumentId(documentId);
        logger.info("Cleared chat history for document id {}", documentId);
    }

    private List<CitationDto> parseCitations(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<CitationDto>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}


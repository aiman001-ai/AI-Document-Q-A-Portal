package com.aidocument.portal.controller;

import com.aidocument.portal.dto.ApiResponse;
import com.aidocument.portal.dto.ChatRequest;
import com.aidocument.portal.dto.ChatResponse;
import com.aidocument.portal.security.UserPrincipal;
import com.aidocument.portal.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askQuestion(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ChatResponse response = chatService.askQuestion(request, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history/{documentId}")
    public ResponseEntity<List<ChatResponse>> getChatHistory(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ChatResponse> history = chatService.getChatHistory(documentId, userPrincipal.getId());
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{documentId}")
    public ResponseEntity<ApiResponse> clearChatHistory(
            @PathVariable Long documentId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        chatService.clearChatHistory(documentId, userPrincipal.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Chat history cleared successfully"));
    }
}


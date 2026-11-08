package com.aidocument.portal.controller;

import com.aidocument.portal.dto.ChatRequest;
import com.aidocument.portal.dto.ChatResponse;
import com.aidocument.portal.dto.CitationDto;
import com.aidocument.portal.security.JwtAuthenticationEntryPoint;
import com.aidocument.portal.security.JwtTokenProvider;
import com.aidocument.portal.security.UserPrincipal;
import com.aidocument.portal.service.ChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
@AutoConfigureMockMvc(addFilters = false)
class ChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatService chatService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Test
    @DisplayName("Should ask question and receive AI answer with citations")
    void testAskQuestion() throws Exception {
        ChatRequest request = new ChatRequest(5L, "What is the policy expiration date?");
        CitationDto citation = new CitationDto(0, 1, "Policy expires on 31 Dec 2026", 12.0);
        ChatResponse response = new ChatResponse(1L, 5L, request.getQuestion(), "The policy expires on December 31, 2026 [Page 1].", List.of(citation));

        UserPrincipal principal = new UserPrincipal(1L, "user1", "user1@example.com", "pass", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        when(chatService.askQuestion(any(ChatRequest.class), eq(1L))).thenReturn(response);

        mockMvc.perform(post("/api/chat/ask")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.question").value("What is the policy expiration date?"))
                .andExpect(jsonPath("$.answer").value("The policy expires on December 31, 2026 [Page 1]."))
                .andExpect(jsonPath("$.citations[0].pageNumber").value(1));
    }

    @Test
    @DisplayName("Should retrieve chat history for a document")
    void testGetChatHistory() throws Exception {
        ChatResponse resp = new ChatResponse(1L, 5L, "Question?", "Answer.", List.of());
        UserPrincipal principal = new UserPrincipal(1L, "user1", "user1@example.com", "pass", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());

        when(chatService.getChatHistory(5L, 1L)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/chat/history/5")
                        .with(authentication(auth)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].question").value("Question?"))
                .andExpect(jsonPath("$[0].answer").value("Answer."));
    }
}


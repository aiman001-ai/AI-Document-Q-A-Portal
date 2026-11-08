package com.aidocument.portal.controller;

import com.aidocument.portal.dto.AuthRequest;
import com.aidocument.portal.dto.AuthResponse;
import com.aidocument.portal.dto.RegisterRequest;
import com.aidocument.portal.repository.UserRepository;
import com.aidocument.portal.security.JwtAuthenticationEntryPoint;
import com.aidocument.portal.security.JwtTokenProvider;
import com.aidocument.portal.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Test
    @DisplayName("Should successfully register a new user")
    void testRegisterUserSuccess() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest("john_doe", "john@example.com", "password123");
        AuthResponse authResponse = new AuthResponse("mock.jwt.token", 1L, "john_doe", "john@example.com", "ROLE_USER");

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.username").value("john_doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"));
    }

    @Test
    @DisplayName("Should successfully authenticate user and return JWT")
    void testLoginSuccess() throws Exception {
        AuthRequest authRequest = new AuthRequest("john_doe", "password123");
        AuthResponse authResponse = new AuthResponse("mock.jwt.token", 1L, "john_doe", "john@example.com", "ROLE_USER");

        when(authService.login(any(AuthRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.jwt.token"))
                .andExpect(jsonPath("$.username").value("john_doe"));
    }
}


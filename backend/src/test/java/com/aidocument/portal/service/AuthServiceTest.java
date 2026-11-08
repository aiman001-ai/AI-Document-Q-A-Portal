package com.aidocument.portal.service;

import com.aidocument.portal.dto.AuthRequest;
import com.aidocument.portal.dto.AuthResponse;
import com.aidocument.portal.dto.RegisterRequest;
import com.aidocument.portal.entity.Role;
import com.aidocument.portal.entity.User;
import com.aidocument.portal.repository.UserRepository;
import com.aidocument.portal.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("testuser", "test@example.com", "encodedPass", Role.ROLE_USER);
        sampleUser.setId(10L);
    }

    @Test
    @DisplayName("Register: Should successfully save user and return token")
    void testRegisterUser() {
        RegisterRequest request = new RegisterRequest("testuser", "test@example.com", "plainPass");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("plainPass")).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(tokenProvider.generateTokenFromUsername("testuser", 10L, "test@example.com"))
                .thenReturn("mocked.jwt.token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("mocked.jwt.token", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Register: Should throw exception if username already exists")
    void testRegisterDuplicateUsername() {
        RegisterRequest request = new RegisterRequest("testuser", "test@example.com", "plainPass");
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login: Should authenticate and return token for valid credentials")
    void testLoginValidCredentials() {
        AuthRequest request = new AuthRequest("testuser", "plainPass");
        Authentication authMock = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authMock);
        when(tokenProvider.generateToken(authMock)).thenReturn("mocked.jwt.token");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getToken());
        assertEquals("testuser", response.getUsername());
    }
}


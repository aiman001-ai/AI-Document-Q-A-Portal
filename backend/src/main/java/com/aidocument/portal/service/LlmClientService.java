package com.aidocument.portal.service;

import com.aidocument.portal.dto.CitationDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class LlmClientService {

    private static final Logger logger = LoggerFactory.getLogger(LlmClientService.class);

    @Value("${app.ai.api-key:}")
    private String apiKey;

    @Value("${app.ai.model:gpt-4o-mini}")
    private String modelName;

    @Value("${app.ai.provider:auto}")
    private String provider;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateAnswer(String question, List<CitationDto> citations, String documentTitle) {
        if (citations == null || citations.isEmpty()) {
            return "I couldn't find enough relevant information in **" + documentTitle + "** to answer your question accurately.";
        }

        // Try calling external LLM if API key is provided
        if (apiKey != null && !apiKey.isBlank() && !apiKey.equalsIgnoreCase("none")) {
            try {
                if (provider.equalsIgnoreCase("gemini") || apiKey.startsWith("AIza")) {
                    return callGeminiApi(question, citations, documentTitle);
                } else {
                    return callOpenAiApi(question, citations, documentTitle);
                }
            } catch (Exception ex) {
                logger.warn("External API call failed: {}. Using local fallback extractor.", ex.getMessage());
            }
        }

        // Local extractor fallback
        return synthesizeOfflineAnswer(question, citations, documentTitle);
    }

    private String callOpenAiApi(String question, List<CitationDto> citations, String documentTitle) throws Exception {
        String endpoint = "https://api.openai.com/v1/chat/completions";

        StringBuilder contextBuilder = new StringBuilder();
        for (CitationDto citation : citations) {
            contextBuilder.append(String.format("[Source: Page %d, Chunk %d]\n%s\n\n",
                    citation.getPageNumber(), citation.getChunkIndex(), citation.getSnippet()));
        }

        String systemPrompt = "You are a document analysis assistant. "
                + "Answer the user's question accurately using ONLY the provided document context from '" + documentTitle + "'. "
                + "Always cite the specific page numbers in your answer using markdown like **[Page X]**. "
                + "If the context doesn't contain the answer, politely state that the document does not mention it.";

        Map<String, Object> messageSystem = Map.of("role", "system", "content", systemPrompt);
        Map<String, Object> messageUser = Map.of("role", "user", "content",
                "Context:\n" + contextBuilder + "\n\nQuestion: " + question);

        Map<String, Object> requestBody = Map.of(
                "model", modelName,
                "messages", List.of(messageSystem, messageUser),
                "temperature", 0.2
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("choices").path(0).path("message").path("content").asText();
        }

        throw new RuntimeException("OpenAI API returned non-200 status: " + response.getStatusCode());
    }

    private String callGeminiApi(String question, List<CitationDto> citations, String documentTitle) throws Exception {
        String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        StringBuilder contextBuilder = new StringBuilder();
        for (CitationDto citation : citations) {
            contextBuilder.append(String.format("[Page %d]: %s\n\n", citation.getPageNumber(), citation.getSnippet()));
        }

        String prompt = "You are an AI Document Assistant. Use this context from '" + documentTitle + "':\n"
                + contextBuilder
                + "\nAnswer the question: " + question
                + "\nCite [Page X] for facts.";

        Map<String, Object> parts = Map.of("text", prompt);
        Map<String, Object> contentObj = Map.of("parts", List.of(parts));
        Map<String, Object> requestBody = Map.of("contents", List.of(contentObj));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            JsonNode root = objectMapper.readTree(response.getBody());
            return root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
        }

        throw new RuntimeException("Gemini API returned error: " + response.getStatusCode());
    }

    /**
     * Fallback text extractor that identifies matching sentences from top citations.
     */
    public String synthesizeOfflineAnswer(String question, List<CitationDto> citations, String documentTitle) {
        String lowerQ = question.toLowerCase().trim();

        // Check for summary intent
        if (lowerQ.contains("summar") || lowerQ.contains("overview") || lowerQ.contains("about") || lowerQ.contains("describe")) {
            return generateDocumentSummary(citations, documentTitle);
        }

        // Look for extracted relevant sentences across the citations
        List<String> matchingSentences = new ArrayList<>();
        Set<Integer> citedPages = new TreeSet<>();

        String[] keywords = lowerQ.replaceAll("[^a-zA-Z0-9 ]", "").split("\\s+");

        for (CitationDto citation : citations) {
            String snippet = citation.getSnippet();
            String[] sentences = snippet.split("(?<=[.!?\\n])\\s+");

            for (String sentence : sentences) {
                String cleanSentence = sentence.trim();
                if (cleanSentence.length() < 15) continue;

                int matches = 0;
                String lowerSentence = cleanSentence.toLowerCase();
                for (String kw : keywords) {
                    if (kw.length() > 2 && lowerSentence.contains(kw)) {
                        matches++;
                    }
                }

                if (matches > 0 && !matchingSentences.contains(cleanSentence)) {
                    matchingSentences.add(cleanSentence);
                    citedPages.add(citation.getPageNumber());
                }
            }
        }

        // Format cited pages string
        String pagesFormatted = citedPages.isEmpty()
                ? "Page " + citations.get(0).getPageNumber()
                : citedPages.stream().map(p -> "Page " + p).reduce((a, b) -> a + ", " + b).orElse("Page 1");

        if (matchingSentences.isEmpty()) {
            // Fallback: provide top snippet with citation
            CitationDto top = citations.get(0);
            return String.format(
                    "Based on **%s** (%s):\n\n> %s\n\n*Reference: %s, Chunk #%d (Confidence: %.1f)*",
                    documentTitle,
                    pagesFormatted,
                    top.getSnippet(),
                    "Page " + top.getPageNumber(),
                    top.getChunkIndex(),
                    top.getScore() != null ? top.getScore() : 1.0
            );
        }

        // Build structured bullet response
        StringBuilder response = new StringBuilder();
        response.append(String.format("Based on **%s** (**%s**), here is the relevant information:\n\n",
                documentTitle, pagesFormatted));

        int count = 0;
        for (String sentence : matchingSentences) {
            response.append("• ").append(sentence).append("\n\n");
            count++;
            if (count >= 4) break;
        }

        response.append(String.format("\n*Source: %s*", pagesFormatted));
        return response.toString();
    }

    private String generateDocumentSummary(List<CitationDto> citations, String documentTitle) {
        StringBuilder sb = new StringBuilder();
        sb.append("### Summary of **").append(documentTitle).append("**\n\n");
        sb.append("Here are key highlights extracted from the document:\n\n");

        int count = 0;
        for (CitationDto c : citations) {
            sb.append("• **Page ").append(c.getPageNumber()).append("**: ")
                    .append(c.getSnippet().replaceAll("[\\r\\n]+", " ").trim())
                    .append("\n\n");
            count++;
            if (count >= 3) break;
        }

        sb.append("*You can ask specific questions about figures, terms, parties, dates, or policies contained within this document.*");
        return sb.toString();
    }
}


package com.aidocument.portal.service;

import com.aidocument.portal.dto.CitationDto;
import com.aidocument.portal.entity.Document;
import com.aidocument.portal.entity.DocumentChunk;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class RagService {

    @Value("${app.ai.chunk-size:600}")
    private int defaultChunkSize;

    @Value("${app.ai.chunk-overlap:100}")
    private int defaultChunkOverlap;

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but",
            "by", "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for",
            "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself",
            "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just",
            "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on", "once",
            "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "s", "same", "she",
            "should", "so", "some", "such", "t", "than", "that", "the", "their", "theirs", "them",
            "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too",
            "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which",
            "while", "who", "whom", "why", "will", "with", "would", "you", "your", "yours", "yourself"
    );

    private static final Pattern WORD_PATTERN = Pattern.compile("[\\p{L}\\p{Nd}]+");

    public List<DocumentChunk> createChunks(Document document, Map<Integer, String> pageTexts) {
        return createChunks(document, pageTexts, defaultChunkSize, defaultChunkOverlap);
    }

    public List<DocumentChunk> createChunks(Document document, Map<Integer, String> pageTexts, int chunkSize, int overlap) {
        List<DocumentChunk> chunks = new ArrayList<>();
        int chunkIndex = 0;

        for (Map.Entry<Integer, String> entry : pageTexts.entrySet()) {
            int pageNumber = entry.getKey();
            String text = entry.getValue();

            if (text == null || text.isBlank()) {
                continue;
            }

            int length = text.length();
            int start = 0;

            while (start < length) {
                int end = Math.min(start + chunkSize, length);

                // Try to break at a newline or period if possible
                if (end < length) {
                    int lastPeriod = text.lastIndexOf('.', end);
                    int lastNewline = text.lastIndexOf('\n', end);
                    int breakPoint = Math.max(lastPeriod, lastNewline);
                    if (breakPoint > start + (chunkSize / 2)) {
                        end = breakPoint + 1;
                    }
                }

                String chunkText = text.substring(start, end).trim();
                if (!chunkText.isBlank()) {
                    DocumentChunk chunk = new DocumentChunk(document, chunkIndex++, pageNumber, chunkText);
                    chunks.add(chunk);
                }

                if (end >= length) {
                    break;
                }

                start = Math.max(start + 1, end - overlap);
            }
        }

        return chunks;
    }

    public record ScoredChunk(DocumentChunk chunk, double score) {}

    public List<CitationDto> retrieveTopChunks(List<DocumentChunk> chunks, String query, int topK) {
        if (chunks.isEmpty() || query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        List<String> queryTokens = extractTokens(query);
        String normalizedQuery = query.toLowerCase().trim();

        List<ScoredChunk> scoredChunks = new ArrayList<>();

        for (DocumentChunk chunk : chunks) {
            String chunkContent = chunk.getContent();
            String normalizedContent = chunkContent.toLowerCase();

            double score = 0.0;

            // Exact query match bonus
            if (normalizedContent.contains(normalizedQuery)) {
                score += 15.0;
            }

            // Keyword token frequency match
            List<String> chunkTokens = extractTokens(chunkContent);
            if (!chunkTokens.isEmpty()) {
                Map<String, Long> tokenFreq = chunkTokens.stream()
                        .collect(Collectors.groupingBy(w -> w, Collectors.counting()));

                for (String qToken : queryTokens) {
                    if (tokenFreq.containsKey(qToken)) {
                        long freq = tokenFreq.get(qToken);
                        // TF weight with saturation
                        score += 2.0 * Math.log(1.0 + freq);
                    }
                }
            }

            // Keyword density bonus
            if (!queryTokens.isEmpty()) {
                long matchedCount = queryTokens.stream().filter(normalizedContent::contains).count();
                double matchRatio = (double) matchedCount / queryTokens.size();
                score += matchRatio * 5.0;
            }

            if (score > 0.0) {
                scoredChunks.add(new ScoredChunk(chunk, score));
            }
        }

        // Sort descending by score
        scoredChunks.sort((a, b) -> Double.compare(b.score(), a.score()));

        // If no matches with score > 0, return first few chunks as fallback context
        if (scoredChunks.isEmpty()) {
            return chunks.stream()
                    .limit(topK)
                    .map(c -> new CitationDto(
                            c.getChunkIndex(),
                            c.getPageNumber(),
                            extractSnippet(c.getContent(), 250),
                            0.1
                    ))
                    .collect(Collectors.toList());
        }

        return scoredChunks.stream()
                .limit(topK)
                .map(sc -> new CitationDto(
                        sc.chunk().getChunkIndex(),
                        sc.chunk().getPageNumber(),
                        extractSnippet(sc.chunk().getContent(), 250),
                        Math.round(sc.score() * 10.0) / 10.0
                ))
                .collect(Collectors.toList());
    }

    private List<String> extractTokens(String text) {
        List<String> tokens = new ArrayList<>();
        var matcher = WORD_PATTERN.matcher(text.toLowerCase());
        while (matcher.find()) {
            String token = matcher.group();
            if (token.length() > 2 && !STOP_WORDS.contains(token)) {
                tokens.add(token);
            }
        }
        return tokens;
    }

    private String extractSnippet(String content, int maxLen) {
        if (content == null) return "";
        if (content.length() <= maxLen) return content;
        return content.substring(0, maxLen).trim() + "...";
    }
}


package com.aidocument.portal.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class PdfParserService {

    private static final Logger logger = LoggerFactory.getLogger(PdfParserService.class);

    public record PdfExtractionResult(int pageCount, Map<Integer, String> pageTexts, String fullText) {}

    public PdfExtractionResult extractTextFromPdf(File pdfFile) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfFile)) {
            int pageCount = document.getNumberOfPages();
            Map<Integer, String> pageTexts = new LinkedHashMap<>();
            StringBuilder fullTextBuilder = new StringBuilder();

            PDFTextStripper stripper = new PDFTextStripper();

            for (int page = 1; page <= pageCount; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);
                String text = stripper.getText(document).trim();
                pageTexts.put(page, text);
                if (!text.isEmpty()) {
                    fullTextBuilder.append(text).append("\n\n");
                }
            }

            logger.info("Successfully extracted {} pages from PDF {}", pageCount, pdfFile.getName());
            return new PdfExtractionResult(pageCount, pageTexts, fullTextBuilder.toString().trim());
        }
    }

    public PdfExtractionResult extractTextFromBytes(byte[] pdfBytes, String filename) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            int pageCount = document.getNumberOfPages();
            Map<Integer, String> pageTexts = new LinkedHashMap<>();
            StringBuilder fullTextBuilder = new StringBuilder();

            PDFTextStripper stripper = new PDFTextStripper();

            for (int page = 1; page <= pageCount; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);
                String text = stripper.getText(document).trim();
                pageTexts.put(page, text);
                if (!text.isEmpty()) {
                    fullTextBuilder.append(text).append("\n\n");
                }
            }

            logger.info("Successfully extracted {} pages from PDF bytes for {}", pageCount, filename);
            return new PdfExtractionResult(pageCount, pageTexts, fullTextBuilder.toString().trim());
        }
    }
}


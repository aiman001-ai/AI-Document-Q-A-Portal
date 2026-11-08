package com.aidocument.portal.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class PdfParserServiceTest {

    private final PdfParserService pdfParserService = new PdfParserService();

    @Test
    @DisplayName("Should extract text and page count from generated PDF bytes")
    void testExtractTextFromBytes() throws IOException {
        byte[] pdfBytes;
        try (PDDocument document = new PDDocument()) {
            PDPage page1 = new PDPage();
            document.addPage(page1);

            try (PDPageContentStream stream = new PDPageContentStream(document, page1)) {
                stream.beginText();
                stream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                stream.newLineAtOffset(100, 700);
                stream.showText("KYC Verification Report: Verified Successfully.");
                stream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            pdfBytes = baos.toByteArray();
        }

        PdfParserService.PdfExtractionResult result = pdfParserService.extractTextFromBytes(pdfBytes, "test.pdf");

        assertNotNull(result);
        assertEquals(1, result.pageCount());
        assertTrue(result.fullText().contains("KYC Verification Report"));
        assertTrue(result.pageTexts().containsKey(1));
    }
}


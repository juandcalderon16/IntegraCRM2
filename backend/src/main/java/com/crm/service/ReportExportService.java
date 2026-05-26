package com.crm.service;

import com.crm.dto.DashboardStatsDto;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final DashboardService dashboardService;

    public byte[] dashboardPdf() throws Exception {
        DashboardStatsDto s = dashboardService.stats();
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        Document doc = new Document();
        PdfWriter.getInstance(doc, bos);
        doc.open();
        doc.add(new Paragraph("CRM — Reporte ejecutivo"));
        doc.add(new Paragraph(" "));
        doc.add(new Paragraph("Clientes activos: " + s.activeCustomers()));
        doc.add(new Paragraph("Oportunidades abiertas: " + s.openOpportunities()));
        doc.add(new Paragraph("Ventas cerradas (ganadas): " + s.closedWonDeals()));
        doc.add(new Paragraph("Ingresos oportunidades ganadas: " + s.closedWonRevenue()));
        doc.close();
        return bos.toByteArray();
    }

    public byte[] dashboardExcel() throws Exception {
        DashboardStatsDto s = dashboardService.stats();
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sh = wb.createSheet("Dashboard");
            Row h = sh.createRow(0);
            h.createCell(0).setCellValue("Indicador");
            h.createCell(1).setCellValue("Valor");
            Row r1 = sh.createRow(1);
            r1.createCell(0).setCellValue("Clientes activos");
            r1.createCell(1).setCellValue(s.activeCustomers());
            Row r2 = sh.createRow(2);
            r2.createCell(0).setCellValue("Oportunidades abiertas");
            r2.createCell(1).setCellValue(s.openOpportunities());
            Row r3 = sh.createRow(3);
            r3.createCell(0).setCellValue("Ventas cerradas (ganadas)");
            r3.createCell(1).setCellValue(s.closedWonDeals());
            Row r4 = sh.createRow(4);
            r4.createCell(0).setCellValue("Ingresos (ganadas)");
            r4.createCell(1).setCellValue(s.closedWonRevenue() != null ? s.closedWonRevenue().doubleValue() : 0);
            wb.write(bos);
            return bos.toByteArray();
        }
    }

    public byte[] customersExcel(List<Map<String, Object>> rows) throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            Sheet sh = wb.createSheet("Clientes");
            Row header = sh.createRow(0);
            header.createCell(0).setCellValue("ID");
            header.createCell(1).setCellValue("Nombre");
            header.createCell(2).setCellValue("Email");
            header.createCell(3).setCellValue("Empresa");
            header.createCell(4).setCellValue("Estado");
            int i = 1;
            for (Map<String, Object> row : rows) {
                Row r = sh.createRow(i++);
                r.createCell(0).setCellValue(((Number) row.get("id")).longValue());
                r.createCell(1).setCellValue(String.valueOf(row.get("name")));
                r.createCell(2).setCellValue(String.valueOf(row.get("email")));
                r.createCell(3).setCellValue(String.valueOf(row.get("company")));
                r.createCell(4).setCellValue(String.valueOf(row.get("status")));
            }
            wb.write(bos);
            return bos.toByteArray();
        }
    }
}

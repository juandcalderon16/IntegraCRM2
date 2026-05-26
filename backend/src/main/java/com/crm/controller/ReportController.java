package com.crm.controller;

import com.crm.service.CustomerService;
import com.crm.service.ReportExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportExportService reportExportService;
    private final CustomerService customerService;

    @GetMapping("/dashboard.pdf")
    @PreAuthorize("hasAuthority('reports.export')")
    public ResponseEntity<byte[]> dashboardPdf() throws Exception {
        byte[] body = reportExportService.dashboardPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=dashboard.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(body);
    }

    @GetMapping("/dashboard.xlsx")
    @PreAuthorize("hasAuthority('reports.export')")
    public ResponseEntity<byte[]> dashboardExcel() throws Exception {
        byte[] body = reportExportService.dashboardExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=dashboard.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(body);
    }

    @GetMapping("/customers.xlsx")
    @PreAuthorize("hasAuthority('reports.export')")
    public ResponseEntity<byte[]> customersExcel() throws Exception {
        byte[] body = reportExportService.customersExcel(customerService.listAll());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=clientes.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(body);
    }
}

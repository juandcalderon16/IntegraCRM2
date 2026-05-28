package com.crm.service;

import com.crm.dto.DashboardStatsDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportExportServiceTest {

    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private ReportExportService reportExportService;

    @Test
    void dashboardPdfGeneratesNonEmptyBytes() throws Exception {
        when(dashboardService.stats()).thenReturn(new DashboardStatsDto(10, 5, 2, new BigDecimal("1000")));

        byte[] pdf = reportExportService.dashboardPdf();

        assertThat(pdf).isNotEmpty();
        assertThat(new String(pdf, 0, 4)).isEqualTo("%PDF");
    }

    @Test
    void dashboardExcelGeneratesWorkbookBytes() throws Exception {
        when(dashboardService.stats()).thenReturn(new DashboardStatsDto(1, 2, 3, new BigDecimal("500")));

        byte[] xlsx = reportExportService.dashboardExcel();

        assertThat(xlsx).isNotEmpty();
        assertThat(xlsx[0]).isEqualTo((byte) 0x50); // PK zip header
        assertThat(xlsx[1]).isEqualTo((byte) 0x4B);
    }

    @Test
    void customersExcelIncludesRows() throws Exception {
        List<Map<String, Object>> rows = List.of(
                Map.of("id", 1L, "name", "Acme", "email", "a@acme.test", "company", "Acme", "status", "ACTIVE"));

        byte[] xlsx = reportExportService.customersExcel(rows);

        assertThat(xlsx).isNotEmpty();
        assertThat(xlsx.length).isGreaterThan(100);
    }
}

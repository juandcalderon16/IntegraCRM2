package com.crm.service;

import com.crm.domain.Campaign;
import com.crm.domain.CampaignMetric;
import com.crm.dto.CampaignMetricRequest;
import com.crm.dto.CampaignRequest;
import com.crm.repository.CampaignMetricRepository;
import com.crm.repository.CampaignRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CampaignServiceTest {

    @Mock
    private CampaignRepository campaignRepository;

    @Mock
    private CampaignMetricRepository metricRepository;

    @InjectMocks
    private CampaignService campaignService;

    @Test
    void campaignEffectivenessCalculatesCtrAndConversion() {
        Campaign campaign = Campaign.builder().id(1L).name("Q1 Email").build();
        CampaignMetric metric = CampaignMetric.builder()
                .campaign(campaign)
                .impressions(1000)
                .clicks(100)
                .conversions(10)
                .leadsGenerated(5)
                .revenueAttributed(new BigDecimal("5000"))
                .recordedAt(Instant.now())
                .build();

        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(metricRepository.findByCampaign_IdOrderByRecordedAtDesc(1L)).thenReturn(List.of(metric));

        Map<String, Object> result = campaignService.campaignEffectiveness(1L);

        assertThat(result.get("campaignName")).isEqualTo("Q1 Email");
        assertThat(result.get("totalImpressions")).isEqualTo(1000L);
        assertThat(result.get("totalClicks")).isEqualTo(100L);
        assertThat(result.get("ctrPercent")).isEqualTo(new BigDecimal("10.00"));
        assertThat(result.get("conversionRatePercent")).isEqualTo(new BigDecimal("10.00"));
        assertThat(result.get("attributedRevenue")).isEqualTo(new BigDecimal("5000"));
    }

    @Test
    void campaignEffectivenessReturnsZeroRatesWhenNoImpressions() {
        Campaign campaign = Campaign.builder().id(2L).name("Empty").build();
        when(campaignRepository.findById(2L)).thenReturn(Optional.of(campaign));
        when(metricRepository.findByCampaign_IdOrderByRecordedAtDesc(2L)).thenReturn(List.of());

        Map<String, Object> result = campaignService.campaignEffectiveness(2L);

        assertThat(result.get("ctrPercent")).isEqualTo(BigDecimal.ZERO);
        assertThat(result.get("conversionRatePercent")).isEqualTo(BigDecimal.ZERO);
    }

    @Test
    void getCampaignThrowsWhenNotFound() {
        when(campaignRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> campaignService.getCampaign(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("404");
    }

    @Test
    void createCampaignPersistsRequestFields() {
        CampaignRequest req = new CampaignRequest("Nueva", "EMAIL", "ACTIVE", new BigDecimal("1000"), null, null, "Desc");
        Campaign saved = Campaign.builder().id(10L).name("Nueva").channel("EMAIL").status("ACTIVE").build();
        when(campaignRepository.save(any(Campaign.class))).thenReturn(saved);

        Map<String, Object> map = campaignService.createCampaign(req);

        assertThat(map.get("id")).isEqualTo(10L);
        assertThat(map.get("name")).isEqualTo("Nueva");
        ArgumentCaptor<Campaign> captor = ArgumentCaptor.forClass(Campaign.class);
        verify(campaignRepository).save(captor.capture());
        assertThat(captor.getValue().getChannel()).isEqualTo("EMAIL");
    }

    @Test
    void addMetricSavesMetricForCampaign() {
        Campaign campaign = Campaign.builder().id(1L).name("Q1").build();
        CampaignMetric saved = CampaignMetric.builder()
                .id(5L)
                .campaign(campaign)
                .impressions(100)
                .clicks(10)
                .conversions(2)
                .leadsGenerated(1)
                .revenueAttributed(new BigDecimal("200"))
                .recordedAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();

        when(campaignRepository.findById(1L)).thenReturn(Optional.of(campaign));
        when(metricRepository.save(any(CampaignMetric.class))).thenReturn(saved);

        Map<String, Object> map = campaignService.addMetric(
                1L,
                new CampaignMetricRequest(100, 10, 2, 1, new BigDecimal("200")));

        assertThat(map.get("campaignId")).isEqualTo(1L);
        assertThat(map.get("impressions")).isEqualTo(100L);
        verify(metricRepository).save(any(CampaignMetric.class));
    }
}

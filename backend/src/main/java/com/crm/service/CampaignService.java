package com.crm.service;

import com.crm.domain.Campaign;
import com.crm.domain.CampaignMetric;
import com.crm.dto.CampaignMetricRequest;
import com.crm.dto.CampaignRequest;
import com.crm.repository.CampaignMetricRepository;
import com.crm.repository.CampaignRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final CampaignMetricRepository metricRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listCampaigns() {
        return campaignRepository.findAll().stream().map(this::campaignMap).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCampaign(Long id) {
        return campaignRepository.findById(id).map(this::campaignMap)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> metrics(Long campaignId) {
        ensureCampaign(campaignId);
        return metricRepository.findByCampaign_IdOrderByRecordedAtDesc(campaignId).stream()
                .map(this::metricMap)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> campaignEffectiveness(Long campaignId) {
        Campaign c = ensureCampaign(campaignId);
        List<CampaignMetric> all = metricRepository.findByCampaign_IdOrderByRecordedAtDesc(campaignId);
        long impressions = all.stream().mapToLong(CampaignMetric::getImpressions).sum();
        long clicks = all.stream().mapToLong(CampaignMetric::getClicks).sum();
        long conversions = all.stream().mapToLong(CampaignMetric::getConversions).sum();
        BigDecimal revenue = all.stream()
                .map(CampaignMetric::getRevenueAttributed)
                .reduce(BigDecimal.ZERO, (a, b) -> a.add(b != null ? b : BigDecimal.ZERO));
        BigDecimal ctr = impressions > 0
                ? BigDecimal.valueOf(clicks * 100.0 / impressions).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal convRate = clicks > 0
                ? BigDecimal.valueOf(conversions * 100.0 / clicks).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("campaignId", c.getId());
        m.put("campaignName", c.getName());
        m.put("totalImpressions", impressions);
        m.put("totalClicks", clicks);
        m.put("totalConversions", conversions);
        m.put("ctrPercent", ctr);
        m.put("conversionRatePercent", convRate);
        m.put("attributedRevenue", revenue);
        return m;
    }

    @Transactional
    public Map<String, Object> createCampaign(CampaignRequest req) {
        Campaign c = new Campaign();
        applyCampaign(c, req);
        return campaignMap(campaignRepository.save(c));
    }

    @Transactional
    public Map<String, Object> updateCampaign(Long id, CampaignRequest req) {
        Campaign c = ensureCampaign(id);
        applyCampaign(c, req);
        return campaignMap(campaignRepository.save(c));
    }

    @Transactional
    public Map<String, Object> addMetric(Long campaignId, CampaignMetricRequest req) {
        Campaign c = ensureCampaign(campaignId);
        CampaignMetric m = CampaignMetric.builder()
                .campaign(c)
                .impressions(req.impressions())
                .clicks(req.clicks())
                .conversions(req.conversions())
                .leadsGenerated(req.leadsGenerated())
                .revenueAttributed(req.revenueAttributed() != null ? req.revenueAttributed() : BigDecimal.ZERO)
                .recordedAt(Instant.now())
                .build();
        return metricMap(metricRepository.save(m));
    }

    private Campaign ensureCampaign(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    private void applyCampaign(Campaign c, CampaignRequest req) {
        c.setName(req.name());
        c.setChannel(req.channel());
        if (req.status() != null) {
            c.setStatus(req.status());
        }
        c.setBudget(req.budget());
        c.setStartDate(req.startDate());
        c.setEndDate(req.endDate());
        c.setDescription(req.description());
    }

    private Map<String, Object> campaignMap(Campaign c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("name", c.getName());
        m.put("channel", c.getChannel());
        m.put("status", c.getStatus());
        m.put("budget", c.getBudget());
        m.put("startDate", c.getStartDate() != null ? c.getStartDate().toString() : null);
        m.put("endDate", c.getEndDate() != null ? c.getEndDate().toString() : null);
        m.put("description", c.getDescription());
        return m;
    }

    private Map<String, Object> metricMap(CampaignMetric m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("campaignId", m.getCampaign().getId());
        map.put("impressions", m.getImpressions());
        map.put("clicks", m.getClicks());
        map.put("conversions", m.getConversions());
        map.put("leadsGenerated", m.getLeadsGenerated());
        map.put("revenueAttributed", m.getRevenueAttributed());
        map.put("recordedAt", m.getRecordedAt().toString());
        return map;
    }
}

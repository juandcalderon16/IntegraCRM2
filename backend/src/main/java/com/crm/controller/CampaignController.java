package com.crm.controller;

import com.crm.dto.CampaignMetricRequest;
import com.crm.dto.CampaignRequest;
import com.crm.service.CampaignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @GetMapping
    @PreAuthorize("hasAuthority('campaigns.read')")
    public List<Map<String, Object>> list() {
        return campaignService.listCampaigns();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('campaigns.read')")
    public Map<String, Object> get(@PathVariable Long id) {
        return campaignService.getCampaign(id);
    }

    @GetMapping("/{id}/metrics")
    @PreAuthorize("hasAuthority('campaigns.read')")
    public List<Map<String, Object>> metrics(@PathVariable Long id) {
        return campaignService.metrics(id);
    }

    @GetMapping("/{id}/effectiveness")
    @PreAuthorize("hasAuthority('campaigns.read')")
    public Map<String, Object> effectiveness(@PathVariable Long id) {
        return campaignService.campaignEffectiveness(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('campaigns.write')")
    public Map<String, Object> create(@Valid @RequestBody CampaignRequest req) {
        return campaignService.createCampaign(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('campaigns.write')")
    public Map<String, Object> update(@PathVariable Long id, @Valid @RequestBody CampaignRequest req) {
        return campaignService.updateCampaign(id, req);
    }

    @PostMapping("/{id}/metrics")
    @PreAuthorize("hasAuthority('campaigns.write')")
    public Map<String, Object> addMetric(@PathVariable Long id, @Valid @RequestBody CampaignMetricRequest req) {
        return campaignService.addMetric(id, req);
    }
}

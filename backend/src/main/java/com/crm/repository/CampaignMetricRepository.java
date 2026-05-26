package com.crm.repository;

import com.crm.domain.CampaignMetric;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampaignMetricRepository extends JpaRepository<CampaignMetric, Long> {

    List<CampaignMetric> findByCampaign_IdOrderByRecordedAtDesc(Long campaignId);
}

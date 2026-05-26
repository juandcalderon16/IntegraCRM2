package com.crm.graphql.types;

public record CampaignEffectiveness(
        long campaignId,
        String campaignName,
        long totalImpressions,
        long totalClicks,
        long totalConversions,
        double ctrPercent,
        double conversionRatePercent,
        double attributedRevenue
) {}

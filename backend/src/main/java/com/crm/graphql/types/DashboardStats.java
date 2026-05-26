package com.crm.graphql.types;

public record DashboardStats(
        int activeCustomers,
        int openOpportunities,
        int closedWonDeals,
        double closedWonRevenue
) {}

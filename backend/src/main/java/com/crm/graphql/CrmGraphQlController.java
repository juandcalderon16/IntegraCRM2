package com.crm.graphql;

import com.crm.graphql.types.*;
import com.crm.dto.DashboardStatsDto;
import com.crm.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CrmGraphQlController {

    private final DashboardService dashboardService;
    private final CustomerService customerService;
    private final ProspectService prospectService;
    private final CampaignService campaignService;
    private final InteractionService interactionService;

    @QueryMapping
    @PreAuthorize("hasAuthority('dashboard.view')")
    public DashboardStats dashboardStats() {
        DashboardStatsDto s = dashboardService.stats();
        return new DashboardStats(
                (int) s.activeCustomers(),
                (int) s.openOpportunities(),
                (int) s.closedWonDeals(),
                s.closedWonRevenue() != null ? s.closedWonRevenue().doubleValue() : 0d);
    }

    @QueryMapping
    @PreAuthorize("hasAuthority('customers.read')")
    public List<Customer> customers() {
        return customerService.listAll().stream().map(Customer::fromMap).collect(Collectors.toList());
    }

    @QueryMapping
    @PreAuthorize("hasAuthority('customers.read')")
    public Customer customer(@Argument Long id) {
        return Customer.fromMap(customerService.get(id));
    }

    @QueryMapping
    @PreAuthorize("hasAuthority('prospects.read')")
    public List<Prospect> prospects() {
        return prospectService.listPipeline().stream().map(Prospect::fromMap).collect(Collectors.toList());
    }

    @QueryMapping
    @PreAuthorize("hasAuthority('campaigns.read')")
    public List<Campaign> campaigns() {
        return campaignService.listCampaigns().stream().map(Campaign::fromMap).collect(Collectors.toList());
    }

    @QueryMapping
    @PreAuthorize("hasAuthority('campaigns.read')")
    public CampaignEffectiveness campaignEffectiveness(@Argument Long campaignId) {
        Map<String, Object> m = campaignService.campaignEffectiveness(campaignId);
        return new CampaignEffectiveness(
                ((Number) m.get("campaignId")).longValue(),
                (String) m.get("campaignName"),
                ((Number) m.get("totalImpressions")).longValue(),
                ((Number) m.get("totalClicks")).longValue(),
                ((Number) m.get("totalConversions")).longValue(),
                toDouble(m.get("ctrPercent")),
                toDouble(m.get("conversionRatePercent")),
                toDouble(m.get("attributedRevenue")));
    }

    @QueryMapping
    @PreAuthorize("hasAuthority('interactions.read')")
    public List<Interaction> interactions(@Argument Long customerId) {
        return interactionService.byCustomer(customerId).stream().map(Interaction::fromMap).collect(Collectors.toList());
    }

    private static double toDouble(Object o) {
        if (o == null) {
            return 0d;
        }
        if (o instanceof BigDecimal b) {
            return b.doubleValue();
        }
        if (o instanceof Number n) {
            return n.doubleValue();
        }
        return Double.parseDouble(o.toString());
    }
}

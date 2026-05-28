package com.crm.graphql.types;

import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class GraphQlTypesTest {

    @Test
    void customerFromMapMapsFieldsAndNullifiesEmptyStrings() {
        com.crm.graphql.types.Customer customer = com.crm.graphql.types.Customer.fromMap(Map.of(
                "id", 1L,
                "name", "Acme Corp",
                "email", "",
                "phone", "555",
                "company", "Acme",
                "status", "ACTIVE",
                "ownerUserId", 7L));

        assertThat(customer.id()).isEqualTo("1");
        assertThat(customer.name()).isEqualTo("Acme Corp");
        assertThat(customer.email()).isNull();
        assertThat(customer.phone()).isEqualTo("555");
        assertThat(customer.ownerUserId()).isEqualTo("7");
    }

    @Test
    void prospectFromMapHandlesOptionalFields() {
        Prospect prospect = Prospect.fromMap(Map.of(
                "id", 2L,
                "title", "Deal",
                "stage", "LEAD",
                "currency", "USD"));

        assertThat(prospect.title()).isEqualTo("Deal");
        assertThat(prospect.customerId()).isNull();
        assertThat(prospect.amount()).isNull();
    }

    @Test
    void campaignFromMapMapsChannel() {
        Campaign campaign = Campaign.fromMap(Map.of(
                "id", 3L,
                "name", "Q1",
                "channel", "EMAIL",
                "status", "ACTIVE"));

        assertThat(campaign.name()).isEqualTo("Q1");
        assertThat(campaign.channel()).isEqualTo("EMAIL");
    }
}

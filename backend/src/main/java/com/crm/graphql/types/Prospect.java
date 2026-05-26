package com.crm.graphql.types;

import java.util.Map;

public record Prospect(
        String id,
        String title,
        String customerId,
        String stage,
        Double amount,
        String currency,
        String ownerUserId,
        String expectedCloseDate
) {
    public static Prospect fromMap(Map<String, Object> m) {
        Object cid = m.get("customerId");
        Object oid = m.get("ownerUserId");
        Object amt = m.get("amount");
        return new Prospect(
                String.valueOf(m.get("id")),
                String.valueOf(m.get("title")),
                cid != null ? String.valueOf(cid) : null,
                String.valueOf(m.get("stage")),
                amt != null ? ((Number) amt).doubleValue() : null,
                String.valueOf(m.get("currency")),
                oid != null ? String.valueOf(oid) : null,
                m.get("expectedCloseDate") != null ? String.valueOf(m.get("expectedCloseDate")) : null);
    }
}

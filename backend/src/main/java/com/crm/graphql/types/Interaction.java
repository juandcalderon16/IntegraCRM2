package com.crm.graphql.types;

import java.util.Map;

public record Interaction(String id, String customerId, String userId, String type, String summary, String occurredAt) {
    public static Interaction fromMap(Map<String, Object> m) {
        Object uid = m.get("userId");
        return new Interaction(
                String.valueOf(m.get("id")),
                String.valueOf(m.get("customerId")),
                uid != null ? String.valueOf(uid) : null,
                String.valueOf(m.get("type")),
                String.valueOf(m.get("summary")),
                String.valueOf(m.get("occurredAt")));
    }
}

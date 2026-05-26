package com.crm.graphql.types;

import java.util.Map;

public record Campaign(String id, String name, String channel, String status) {
    public static Campaign fromMap(Map<String, Object> m) {
        return new Campaign(
                String.valueOf(m.get("id")),
                String.valueOf(m.get("name")),
                m.get("channel") != null ? String.valueOf(m.get("channel")) : null,
                String.valueOf(m.get("status")));
    }
}

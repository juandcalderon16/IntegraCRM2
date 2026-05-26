package com.crm.graphql.types;

import java.util.Map;

public record Customer(
        String id,
        String name,
        String email,
        String phone,
        String company,
        String status,
        String ownerUserId
) {
    public static Customer fromMap(Map<String, Object> m) {
        Object oid = m.get("ownerUserId");
        String owner = oid != null ? String.valueOf(((Number) oid).longValue()) : null;
        return new Customer(
                String.valueOf(m.get("id")),
                String.valueOf(m.get("name")),
                nullIfEmpty(String.valueOf(m.get("email"))),
                nullIfEmpty(String.valueOf(m.get("phone"))),
                nullIfEmpty(String.valueOf(m.get("company"))),
                String.valueOf(m.get("status")),
                owner);
    }

    private static String nullIfEmpty(String s) {
        return s == null || s.isBlank() ? null : s;
    }
}

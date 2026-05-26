import { GraphQLClient } from 'graphql-request';
import { API_BASE } from './api';

export function gqlClient(token: string | null) {
  return new GraphQLClient(`${API_BASE}/graphql`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

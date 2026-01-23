import { DataProvider } from "@refinedev/core";
import { getDatabaseUrl, withDbUrl } from "../utils/database";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://panda-core-admin-gateway-production.up.railway.app/api";

const buildUrl = (
  path: string,
  params?: URLSearchParams,
  includeDbUrl = true,
) => {
  const query = params && params.toString() ? `?${params.toString()}` : "";
  const url = `${API_URL}/${path}${query}`;
  return includeDbUrl ? withDbUrl(url) : url;
};

const withDbUrlInBody = (payload: Record<string, unknown> = {}) => {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) return payload;

  return {
    ...payload,
    dbUrl,
  };
};

export const postgresqlDataProvider = (): DataProvider => {
  return {
    getList: async ({ resource, pagination, filters, sorters, meta }) => {
      const { current = 1, pageSize = 10 } = pagination ?? {};

      const queryParams = new URLSearchParams();
      queryParams.append("_page", current.toString());
      queryParams.append("_limit", pageSize.toString());

      if (sorters && sorters.length > 0) {
        const sorter = sorters[0];
        queryParams.append("_sort", sorter.field);
        queryParams.append("_order", sorter.order);
      }

      if (filters && filters.length > 0) {
        const serializedFilters = filters
          .map((filter) => {
            if ("field" in filter && "operator" in filter) {
              return {
                field: filter.field,
                operator: (filter as any).operator,
                value: "value" in filter ? (filter as any).value : undefined,
              };
            }
            return null;
          })
          .filter(
            (filter): filter is { field: string; operator: string; value: any } =>
              !!filter && filter.value !== undefined,
          );

        if (serializedFilters.length > 0) {
          queryParams.append("filters", JSON.stringify(serializedFilters));
        }
      }

      const response = await fetch(buildUrl(resource, queryParams), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${resource}`);
      }

      const data = await response.json();
      const total = response.headers.get("x-total-count")
        ? parseInt(response.headers.get("x-total-count") || "0")
        : data.length;

      return {
        data: Array.isArray(data) ? data : data.data || [],
        total,
      };
    },

    getOne: async ({ resource, id, meta }) => {
      const response = await fetch(buildUrl(`${resource}/${id}`), {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${resource}/${id}`);
      }

      const data = await response.json();
      return {
        data: data.data || data,
      };
    },

    create: async ({ resource, variables, meta }) => {
      const response = await fetch(buildUrl(resource, undefined, false), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(withDbUrlInBody(variables)),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to create ${resource}`);
      }

      const data = await response.json();
      return {
        data: data.data || data,
      };
    },

    update: async ({ resource, id, variables, meta }) => {
      const response = await fetch(buildUrl(`${resource}/${id}`, undefined, false), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(withDbUrlInBody(variables)),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to update ${resource}/${id}`);
      }

      const data = await response.json();
      return {
        data: data.data || data,
      };
    },

    deleteOne: async ({ resource, id, meta }) => {
      const response = await fetch(buildUrl(`${resource}/${id}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to delete ${resource}/${id}`);
      }

      const data = await response.json();
      return {
        data: data.data || data,
      };
    },

    getApiUrl: () => API_URL,

    custom: async ({ url, method, filters, sorters, payload, query, headers }) => {
      const queryParams = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          queryParams.append(key, String(value));
        });
      }
      const normalizedMethod = method?.toUpperCase() || "GET";
      const shouldUseQueryDbUrl =
        normalizedMethod === "GET" || normalizedMethod === "DELETE";

      const requestUrl = buildUrl(
        url.replace(/^\//, ""),
        queryParams,
        shouldUseQueryDbUrl,
      );

      const response = await fetch(requestUrl, {
        method: normalizedMethod,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: payload
          ? JSON.stringify(
              shouldUseQueryDbUrl ? payload : withDbUrlInBody(payload),
            )
          : undefined,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Request failed");
      }

      const data = await response.json();
      return {
        data: data.data || data,
      };
    },
  };
};

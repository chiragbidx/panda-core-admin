import { DataProvider } from "@refinedev/core";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
        filters.forEach((filter) => {
          if ("field" in filter && "value" in filter) {
            queryParams.append(filter.field, filter.value);
          }
        });
      }

      const url = `${API_URL}/${resource}?${queryParams.toString()}`;
      const response = await fetch(url, {
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
      const url = `${API_URL}/${resource}/${id}`;
      const response = await fetch(url, {
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
      const url = `${API_URL}/${resource}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variables),
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
      const url = `${API_URL}/${resource}/${id}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variables),
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
      const url = `${API_URL}/${resource}/${id}`;
      const response = await fetch(url, {
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
      let requestUrl = `${API_URL}${url}`;

      if (query) {
        const queryParams = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
          queryParams.append(key, String(value));
        });
        requestUrl += `?${queryParams.toString()}`;
      }

      const response = await fetch(requestUrl, {
        method: method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: payload ? JSON.stringify(payload) : undefined,
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

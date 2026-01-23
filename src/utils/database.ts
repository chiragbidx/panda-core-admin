const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://panda-core-admin-gateway-production.up.railway.app/api";
const STORAGE_KEY = "db_connection";

export interface DatabaseTable {
  table_name: string;
  table_schema?: string;
}

export interface TableColumn {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
}

export interface DatabaseConnection {
  dbUrl: string;
}

const appendDbUrl = (url: string): string => {
  const connection = getConnection();
  const dbUrl = connection?.dbUrl;
  if (!dbUrl) return url;

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}dbUrl=${encodeURIComponent(dbUrl)}`;
};

/**
 * Fetch all tables from the database
 */
export const fetchTables = async (): Promise<DatabaseTable[]> => {
  const response = await fetch(appendDbUrl(`${API_URL}/tables`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tables");
  }

  const data = await response.json();
  return data.data || data;
};

/**
 * Fetch columns for a specific table
 */
export const fetchTableColumns = async (
  tableName: string,
): Promise<TableColumn[]> => {
  const response = await fetch(
    appendDbUrl(`${API_URL}/tables/${encodeURIComponent(tableName)}/columns`),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch columns for table ${tableName}`);
  }

  const data = await response.json();
  return data.data || data;
};

/**
 * Test database connection
 */
export const testConnection = async (
  connection: DatabaseConnection,
): Promise<boolean> => {
  const response = await fetch(`${API_URL}/database/connect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dbUrl: connection.dbUrl }),
  });

  if (!response.ok) {
    throw new Error("Failed to connect to database");
  }

  const data = await response.json();
  return data.success || false;
};

/**
 * Save database connection configuration
 */
export const saveConnection = (connection: DatabaseConnection): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connection));
};

/**
 * Get saved database connection configuration
 */
export const getConnection = (): DatabaseConnection | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    if (parsed.databaseUrl && !parsed.dbUrl) {
      return { dbUrl: parsed.databaseUrl as string };
    }
    return parsed as DatabaseConnection;
  } catch {
    return null;
  }
};

export const getDatabaseUrl = (): string | null => {
  const connection = getConnection();
  return connection?.dbUrl || null;
};

export const withDatabaseUrl = appendDbUrl;
export const withDbUrl = appendDbUrl;

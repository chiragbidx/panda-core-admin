const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

/**
 * Fetch all tables from the database
 */
export const fetchTables = async (): Promise<DatabaseTable[]> => {
  const response = await fetch(`${API_URL}/tables`, {
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
  const response = await fetch(`${API_URL}/tables/${tableName}/columns`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

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
    body: JSON.stringify(connection),
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
  localStorage.setItem("db_connection", JSON.stringify(connection));
};

/**
 * Get saved database connection configuration
 */
export const getConnection = (): DatabaseConnection | null => {
  const stored = localStorage.getItem("db_connection");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

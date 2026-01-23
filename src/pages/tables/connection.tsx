import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNotification } from "@refinedev/core";
import {
  testConnection,
  saveConnection,
  getConnection,
  type DatabaseConnection,
} from "../../utils/database";

export const DatabaseConnectionPage: React.FC = () => {
  const { open } = useNotification();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [connection, setConnection] = useState<DatabaseConnection>(() => {
    const savedConnection = getConnection();
    return {
      databaseUrl:
        savedConnection?.databaseUrl ||
        "postgresql://user:password@localhost:5432/database?sslmode=disable",
    };
  });

  const handleTestConnection = async () => {
    if (!connection.databaseUrl) {
      setError("Please enter a PostgreSQL database URL.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const isValid = await testConnection(connection);
      if (isValid) {
        setSuccess(true);
        saveConnection(connection);
        open?.({
          type: "success",
          message: "Connection successful!",
          description: "Database connection established successfully.",
        });
      } else {
        setError("Connection failed. Please check your credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to database");
      open?.({
        type: "error",
        message: "Connection failed",
        description: err.message || "Please check your database credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!connection.databaseUrl) {
      setError("Please enter a PostgreSQL database URL.");
      return;
    }

    saveConnection(connection);
    open?.({
      type: "success",
      message: "Configuration saved",
      description: "Database connection configuration has been saved.",
    });
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Database Connection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide a PostgreSQL connection URL. The URL will be sent to the backend
        gateway and included on every request to fetch tables and data.
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Database URL"
              value={connection.databaseUrl}
              onChange={(e) =>
                setConnection({ ...connection, databaseUrl: e.target.value })
              }
              helperText="Format: postgresql://user:password@host:port/database?sslmode=require"
              fullWidth
              required
            />

            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success">
                Connection successful! You can now browse tables.
              </Alert>
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleTestConnection}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Test Connection
              </Button>
              <Button variant="outlined" onClick={handleSave}>
                Save Configuration
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

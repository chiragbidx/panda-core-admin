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
  FormControlLabel,
  Switch,
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

  const savedConnection = getConnection();
  const [connection, setConnection] = useState<DatabaseConnection>(
    savedConnection || {
      host: "localhost",
      port: 5432,
      database: "",
      user: "",
      password: "",
      ssl: false,
    },
  );

  const handleTestConnection = async () => {
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
        Configure your PostgreSQL database connection. The connection details
        will be used to fetch tables and perform CRUD operations.
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Host"
              value={connection.host}
              onChange={(e) =>
                setConnection({ ...connection, host: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Port"
              type="number"
              value={connection.port}
              onChange={(e) =>
                setConnection({ ...connection, port: parseInt(e.target.value) })
              }
              fullWidth
              required
            />
            <TextField
              label="Database"
              value={connection.database}
              onChange={(e) =>
                setConnection({ ...connection, database: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="User"
              value={connection.user}
              onChange={(e) =>
                setConnection({ ...connection, user: e.target.value })
              }
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={connection.password}
              onChange={(e) =>
                setConnection({ ...connection, password: e.target.value })
              }
              fullWidth
              required
            />
            <FormControlLabel
              control={
                <Switch
                  checked={connection.ssl || false}
                  onChange={(e) =>
                    setConnection({ ...connection, ssl: e.target.checked })
                  }
                />
              }
              label="Use SSL"
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

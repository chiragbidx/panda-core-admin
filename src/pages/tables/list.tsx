import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router";
import { useNotification } from "@refinedev/core";
import { fetchTables, type DatabaseTable } from "../../utils/database";
import TableViewIcon from "@mui/icons-material/TableView";

export const TablesList: React.FC = () => {
  const navigate = useNavigate();
  const { open } = useNotification();
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTables();
      setTables(data);
    } catch (err: any) {
      setError(err.message || "Failed to load tables");
      open?.({
        type: "error",
        message: "Failed to load tables",
        description: err.message || "Please check your database connection.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (tableName: string) => {
    navigate(`/tables/${tableName}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={loadTables}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Database Tables</Typography>
        <Button variant="outlined" onClick={loadTables}>
          Refresh
        </Button>
      </Box>

      {tables.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              No tables found. Make sure your database connection is configured
              correctly.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <List>
            {tables.map((table) => (
              <ListItem key={table.table_name} disablePadding>
                <ListItemButton
                  onClick={() => handleTableClick(table.table_name)}
                >
                  <TableViewIcon sx={{ mr: 2, color: "text.secondary" }} />
                  <ListItemText
                    primary={table.table_name}
                    secondary={
                      table.table_schema
                        ? `Schema: ${table.table_schema}`
                        : undefined
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};

import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useDataGrid, List, EditButton, DeleteButton } from "@refinedev/mui";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useNotification } from "@refinedev/core";
import { fetchTableColumns, type TableColumn } from "../../utils/database";
import { Button, Stack } from "@mui/material";
import { useNavigate } from "react-router";

export const DynamicTableList: React.FC = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const { open } = useNotification();
  const navigate = useNavigate();
  const { dataGridProps } = useDataGrid({
    resource: tableName,
  });
  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [gridColumns, setGridColumns] = useState<GridColDef[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tableName) {
      loadTableColumns();
    }
  }, [tableName]);

  const loadTableColumns = async () => {
    if (!tableName) return;

    setLoading(true);
    try {
      const tableColumns = await fetchTableColumns(tableName);
      setColumns(tableColumns);

      // Generate grid columns from table columns
      const generatedColumns: GridColDef[] = tableColumns.map((col) => ({
        field: col.column_name,
        headerName: col.column_name.replace(/_/g, " ").toUpperCase(),
        minWidth: 150,
        flex: 1,
        type:
          col.data_type === "integer" ||
          col.data_type === "bigint" ||
          col.data_type === "numeric"
            ? "number"
            : "string",
      }));

      // Add actions column
      generatedColumns.push({
        field: "actions",
        headerName: "Actions",
        sortable: false,
        renderCell: function render({ row }) {
          return (
            <>
              <EditButton hideText recordItemId={row.id} />
              <DeleteButton hideText recordItemId={row.id} />
            </>
          );
        },
        align: "center",
        headerAlign: "center",
        minWidth: 120,
      });

      setGridColumns(generatedColumns);
    } catch (err: any) {
      open?.({
        type: "error",
        message: "Failed to load table columns",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <List>Loading table structure...</List>;
  }

  return (
    <List
      headerButtons={() => (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/tables/${tableName}/create`)}
          >
            Add Row
          </Button>
        </Stack>
      )}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 320px)",
        }}
      >
        <DataGrid {...dataGridProps} columns={gridColumns} />
      </div>
    </List>
  );
};

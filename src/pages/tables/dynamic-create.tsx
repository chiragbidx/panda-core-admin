import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import type { HttpError } from "@refinedev/core";
import { Create } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useNotification } from "@refinedev/core";
import { Box } from "@mui/material";
import { fetchTableColumns, type TableColumn } from "../../utils/database";
import {
  DynamicFormFields,
  getEditableColumns,
} from "./form-fields";

export const DynamicTableCreate: React.FC = () => {
  const { tableName } = useParams<{ tableName: string }>();
  const { open } = useNotification();
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    saveButtonProps,
    register,
    control,
    formState: { errors },
  } = useForm<any, HttpError, any>({
    refineCoreProps: {
      resource: tableName,
    },
  });

  useEffect(() => {
    if (tableName) {
      loadTableColumns();
    }
  }, [tableName]);

  const loadTableColumns = async () => {
    if (!tableName) return;

    setLoading(true);
    try {
      const columns = await fetchTableColumns(tableName);
      setTableColumns(getEditableColumns(columns));
    } catch (err: any) {
      open?.({
        type: "error",
        message: "Failed to load table structure",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Create>Loading form...</Create>;
  }

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        <DynamicFormFields
          columns={tableColumns}
          control={control}
          register={register}
          errors={errors}
        />
      </Box>
    </Create>
  );
};

import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import type { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useNotification } from "@refinedev/core";
import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router";
import { fetchTableColumns, getDatabaseUrl, type TableColumn } from "../../utils/database";
import {
  DynamicFormFields,
  getEditableColumns,
} from "./form-fields";

export const DynamicTableEdit: React.FC = () => {
  const { tableName, id } = useParams<{ tableName: string; id: string }>();
  const { open } = useNotification();
  const navigate = useNavigate();
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    saveButtonProps,
    refineCore: { query: queryResult },
    register,
    control,
    formState: { errors },
    reset,
  } = useForm<any, HttpError, any>({
    refineCoreProps: {
      resource: tableName,
      id,
      meta: {
        // Ensure the backend can resolve DB connection for getOne
        query: {
          dbUrl: getDatabaseUrl() || "",
        },
      },
      queryOptions: {
        enabled: !!tableName && !!id,
        onSuccess: (data) => {
          if (data?.data) {
            reset(data.data as any);
          }
        },
      },
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
      // If data already loaded, ensure form is populated with fetched record
      if (queryResult?.data?.data) {
        reset(queryResult.data.data as any);
      }
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

  useEffect(() => {
    const record = queryResult?.data?.data;
    if (record) {
      reset(record as any);
    }
  }, [queryResult?.data?.data, reset]);

  if (loading) {
    return <Edit>Loading form...</Edit>;
  }

  return (
    <Edit
      saveButtonProps={saveButtonProps}
      goBack={
        <Button
          onClick={() => navigate(`/tables/${tableName}`)}
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
      }
    >
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
    </Edit>
  );
};

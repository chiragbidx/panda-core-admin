import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router";
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
  const location = useLocation();
  const locationState = location.state as
    | { record?: Record<string, any>; recordId?: string | number }
    | null;
  const recordFromState = locationState?.record;
  const recordIdFromState = locationState?.recordId;
  const { open } = useNotification();
  const navigate = useNavigate();
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const editId =
    (recordIdFromState ?? recordFromState?.id ?? id ?? "") as string;

  const {
    saveButtonProps,
    register,
    control,
    formState: { errors },
    reset,
    getValues,
  } = useForm<any, HttpError, any>({
    refineCoreProps: {
      resource: tableName,
      id: editId,
      action: "edit",
      successNotification: () => ({
        type: "success",
        message: "Record updated",
      }),
      errorNotification: (error) => ({
        type: "error",
        message: error?.message || "Update failed",
      }),
      meta: {
        // Ensure the backend can resolve DB connection for getOne
        query: {
          dbUrl: getDatabaseUrl() || "",
        },
      },
      // Disable automatic getOne to prevent failing GETs; we hydrate from navigation state
      queryOptions: {
        enabled: false,
        initialData: recordFromState ? { data: recordFromState } : undefined,
        retry: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      onMutationSuccess: (_data, variables) => {
        const nextValues =
          variables ||
          getValues() ||
          recordFromState ||
          {};
        reset(nextValues as any);
      },
    },
    defaultValues: recordFromState as any,
  });

  useEffect(() => {
    if (tableName) {
      loadTableColumns();
    }
  }, [tableName]);

  useEffect(() => {
    if (recordFromState) {
      reset(recordFromState as any);
    }
  }, [recordFromState, reset]);

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

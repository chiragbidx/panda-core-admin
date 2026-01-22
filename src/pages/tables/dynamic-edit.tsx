import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import type { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { useNotification } from "@refinedev/core";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { Controller } from "react-hook-form";
import { fetchTableColumns, type TableColumn } from "../../utils/database";

export const DynamicTableEdit: React.FC = () => {
  const { tableName, id } = useParams<{ tableName: string; id: string }>();
  const { open } = useNotification();
  const [tableColumns, setTableColumns] = useState<TableColumn[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    saveButtonProps,
    refineCore: { query: queryResult },
    register,
    control,
    formState: { errors },
  } = useForm<any, HttpError, any>({
    refineCoreProps: {
      resource: tableName,
      id,
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
      // Filter out auto-generated columns (like id with default)
      const editableColumns = columns.filter(
        (col) =>
          !col.column_default?.includes("nextval") &&
          !col.column_default?.includes("gen_random_uuid"),
      );
      setTableColumns(editableColumns);
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

  const renderField = (column: TableColumn) => {
    const fieldName = column.column_name;
    const isRequired = column.is_nullable === "NO" && !column.column_default;

    if (column.data_type === "boolean") {
      return (
        <Controller
          key={fieldName}
          control={control}
          name={fieldName}
          rules={{ required: isRequired ? "This field is required" : false }}
          render={({ field }) => (
            <FormControl fullWidth margin="normal" error={!!errors[fieldName]}>
              <InputLabel>{fieldName}</InputLabel>
              <Select
                {...field}
                label={fieldName}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value)}
              >
                <MenuItem value="true">True</MenuItem>
                <MenuItem value="false">False</MenuItem>
              </Select>
              {errors[fieldName] && (
                <FormHelperText>
                  {errors[fieldName]?.message as string}
                </FormHelperText>
              )}
            </FormControl>
          )}
        />
      );
    }

    if (
      column.data_type === "integer" ||
      column.data_type === "bigint" ||
      column.data_type === "numeric" ||
      column.data_type === "decimal"
    ) {
      return (
        <TextField
          key={fieldName}
          {...register(fieldName, {
            required: isRequired ? "This field is required" : false,
            valueAsNumber: true,
          })}
          error={!!errors[fieldName]}
          helperText={errors[fieldName]?.message as string}
          margin="normal"
          fullWidth
          label={fieldName}
          type="number"
        />
      );
    }

    if (column.character_maximum_length) {
      return (
        <TextField
          key={fieldName}
          {...register(fieldName, {
            required: isRequired ? "This field is required" : false,
            maxLength: {
              value: column.character_maximum_length,
              message: `Maximum length is ${column.character_maximum_length}`,
            },
          })}
          error={!!errors[fieldName]}
          helperText={errors[fieldName]?.message as string}
          margin="normal"
          fullWidth
          label={fieldName}
          inputProps={{ maxLength: column.character_maximum_length }}
        />
      );
    }

    // Default text field
    return (
      <TextField
        key={fieldName}
        {...register(fieldName, {
          required: isRequired ? "This field is required" : false,
        })}
        error={!!errors[fieldName]}
        helperText={errors[fieldName]?.message as string}
        margin="normal"
        fullWidth
        label={fieldName}
        multiline={column.data_type === "text"}
        rows={column.data_type === "text" ? 4 : 1}
      />
    );
  };

  if (loading) {
    return <Edit>Loading form...</Edit>;
  }

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column" }}
        autoComplete="off"
      >
        {tableColumns.map((column) => renderField(column))}
      </Box>
    </Edit>
  );
};

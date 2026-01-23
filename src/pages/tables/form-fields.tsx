import React from "react";
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { Controller, FieldErrors, UseFormRegister, Control, FieldValues } from "react-hook-form";
import { type TableColumn } from "../../utils/database";

export const getEditableColumns = (columns: TableColumn[]) =>
  columns.filter(
    (col) =>
      !col.column_default?.includes("nextval") &&
      !col.column_default?.includes("gen_random_uuid"),
  );

interface DynamicFormFieldsProps<TFormValues extends FieldValues> {
  columns: TableColumn[];
  control: Control<TFormValues>;
  register: UseFormRegister<TFormValues>;
  errors: FieldErrors<TFormValues>;
}

export const DynamicFormFields = <TFormValues extends Record<string, any>>({
  columns,
  control,
  register,
  errors,
}: DynamicFormFieldsProps<TFormValues>) => {
  return (
    <>
      {columns.map((column) => {
        const fieldName = column.column_name as keyof TFormValues;
        const isRequired = column.is_nullable === "NO" && !column.column_default;

        if (column.data_type === "boolean") {
          return (
            <Controller
              key={column.column_name}
              control={control}
              name={fieldName as any}
              rules={{ required: isRequired ? "This field is required" : false }}
              render={({ field }) => (
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors[fieldName as string]}
                >
                  <InputLabel>{column.column_name}</InputLabel>
                  <Select
                    {...field}
                    label={column.column_name}
                    value={
                      field.value === true || field.value === false
                        ? field.value
                        : ""
                    }
                    onChange={(e) => field.onChange(e.target.value === "true")}
                  >
                    <MenuItem value="true">True</MenuItem>
                    <MenuItem value="false">False</MenuItem>
                  </Select>
                  {errors[fieldName as string] && (
                    <FormHelperText>
                      {errors[fieldName as string]?.message as string}
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
              key={column.column_name}
              {...register(fieldName as any, {
                required: isRequired ? "This field is required" : false,
                valueAsNumber: true,
              })}
              error={!!errors[fieldName as string]}
              helperText={errors[fieldName as string]?.message as string}
              margin="normal"
              fullWidth
              label={column.column_name}
              type="number"
            />
          );
        }

        if (column.character_maximum_length) {
          return (
            <TextField
              key={column.column_name}
              {...register(fieldName as any, {
                required: isRequired ? "This field is required" : false,
                maxLength: {
                  value: column.character_maximum_length,
                  message: `Maximum length is ${column.character_maximum_length}`,
                },
              })}
              error={!!errors[fieldName as string]}
              helperText={errors[fieldName as string]?.message as string}
              margin="normal"
              fullWidth
              label={column.column_name}
              inputProps={{ maxLength: column.character_maximum_length }}
            />
          );
        }

        return (
          <TextField
            key={column.column_name}
            {...register(fieldName as any, {
              required: isRequired ? "This field is required" : false,
            })}
            error={!!errors[fieldName as string]}
            helperText={errors[fieldName as string]?.message as string}
            margin="normal"
            fullWidth
            label={column.column_name}
            multiline={column.data_type === "text"}
            rows={column.data_type === "text" ? 4 : 1}
          />
        );
      })}
    </>
  );
};

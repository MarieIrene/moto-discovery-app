import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { TextField, TextFieldProps } from '@/components/ui';

export interface FormTextFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<T>;
  name: Path<T>;
}

/** Binds a TextField to react-hook-form; validation messages come from the zod schema. */
export function FormTextField<T extends FieldValues>({ control, name, ...rest }: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur, ref }, fieldState: { error } }) => (
        <TextField
          ref={ref}
          value={value == null ? '' : String(value)}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...rest}
        />
      )}
    />
  );
}

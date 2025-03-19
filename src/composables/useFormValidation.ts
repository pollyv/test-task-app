import { reactive, computed, unref } from 'vue';

type ValidationRule<T> = (value: T) => string | true;
type FormFieldsConfig<T> = { [K in keyof T]: ValidationRule<T[K]>[] };

interface FieldState {
  isValid: boolean;
  errors: string[];
}

interface FormValidationState<T> {
  fields: Record<keyof T, FieldState>;
  isValid: boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  formData: T,
  rules: FormFieldsConfig<T>
) {
  const fieldStates = reactive<Record<string, FieldState>>(
    Object.fromEntries(
      Object.keys(rules).map((field) => [field, { isValid: true, errors: [] }])
    )
  );

  const validateField = (field: keyof T, value: unknown) => {
    const fieldRules = rules[field];
    const errors: string[] = [];

    fieldRules.forEach((rule) => {
      const result = rule(value);
      if (typeof result === 'string') {
        errors.push(result);
      }
    });

    fieldStates[field] = {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validateForm = (fieldsToValidate?: (keyof T)[]) => {
    const data = unref(formData);
    const fields = fieldsToValidate || (Object.keys(rules) as (keyof T)[]);
    fields.forEach((field) => validateField(field, data[field]));
  };

  const isFormValid = computed(() => Object.values(fieldStates).every((field) => field.isValid));

  const formState = reactive<FormValidationState<T>>({
    fields: fieldStates,
    isValid: isFormValid.value,
  });

  return {
    formState,
    validateField,
    validateForm,
    isFormValid,
  };
}

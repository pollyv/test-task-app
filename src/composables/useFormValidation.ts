import { reactive, computed, unref } from 'vue';

type ValidationRule<T> = (value: T) => string | true;
type FieldValidationRules<T> = ValidationRule<T>[];
type FormFieldsConfig<T> = Record<keyof T, FieldValidationRules<unknown>>;

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
  const fieldsState = reactive<Record<string, FieldState>>({});

  Object.keys(rules).forEach((field) => {
    fieldsState[field] = {
      isValid: true,
      errors: [],
    };
  });

  const validateField = (field: keyof T, value: unknown) => {
    const fieldRules = rules[field];
    const errors: string[] = [];

    fieldRules.forEach((rule) => {
      const result = rule(value);
      if (typeof result === 'string') {
        errors.push(result);
      }
    });

    fieldsState[field] = {
      isValid: errors.length === 0,
      errors,
    };
  };

  const validateForm = () => {
    const data = unref(formData);
    Object.keys(rules).forEach((field) => {
      validateField(field, data[field]);
    });
  };

  const isFormValid = computed(() => Object.values(fieldsState).every((field) => field.isValid));

  const formState = reactive<FormValidationState<T>>({
    fields: fieldsState,
    isValid: isFormValid.value,
  });

  return {
    formState,
    validateField,
    validateForm,
    isFormValid,
  };
}

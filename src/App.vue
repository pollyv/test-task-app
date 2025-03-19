<template>
  <v-app>
    <v-main>
      <v-container class="pa-6">
        <h1 class="mb-6">Simple Form App</h1>
        <v-card class="pa-6">
          <v-form @submit.prevent="submitForm">
            <v-text-field
              v-model="formData.name"
              label="Name"
              :error-messages="formState.fields.name.errors"
              outlined
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="formData.email"
              label="Email"
              :error-messages="formState.fields.email.errors"
              outlined
              class="mb-4"
            ></v-text-field>
            <v-btn
              type="submit"
              color="primary"
              :disabled="!isFormValid || isLoading"
              :loading="isLoading"
              block
            >
              {{ isLoading ? 'Submitting...' : 'Submit' }}
            </v-btn>
          </v-form>
          <v-alert v-if="apiState.success" type="success" class="mt-4">
            Form submitted successfully!
          </v-alert>
          <v-alert v-if="apiState.error" type="error" class="mt-4">
            {{ apiState.error }}
          </v-alert>
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useFormValidation } from './composables/useFormValidation';
import { useApiRequest } from './composables/useApiRequest';

export default defineComponent({
  name: 'App',
  setup() {
    const formData = ref({
      name: '',
      email: '',
    });

    const rules = {
      name: [
        (v: string) => !!v || 'Name is required',
        (v: string) => v.length >= 3 || 'Name must be at least 3 characters',
      ],
      email: [
        (v: string) => !!v || 'Email is required',
        (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
      ],
    };

    const { formState, validateForm, isFormValid } = useFormValidation(formData, rules);
    const { state: apiState, execute, isLoading } = useApiRequest<{ message: string }>({
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'POST',
    });

    const submitForm = async () => {
      validateForm();
      if (isFormValid.value) {
        await execute({ body: formData.value });
      }
    };

    return { formData, formState, isFormValid, submitForm, apiState, isLoading };
  },
});
</script>

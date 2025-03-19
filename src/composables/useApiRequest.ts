import { reactive, ref, computed } from 'vue';

interface RequestParams {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
}

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  success: boolean;
  error: string | null;
}

export function useApiRequest<T>(initialParams: RequestParams) {
  const state = reactive<ApiState<T>>({
    data: null,
    loading: false,
    success: false,
    error: null,
  });

  const requestParams = ref<RequestParams>({
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...initialParams,
  });

  const execute = async (paramsOverride?: Partial<RequestParams>) => {
    state.loading = true;
    state.success = false;
    state.error = null;

    const finalParams = { ...requestParams.value, ...paramsOverride };

    try {
      const response = await fetch(finalParams.url, {
        method: finalParams.method,
        headers: finalParams.headers,
        body: finalParams.body ? JSON.stringify(finalParams.body) : undefined,
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      state.data = data;
      state.success = true;
    } catch (err) {
      state.error = err instanceof Error ? err.message : 'Unknown error';
      state.success = false;
    } finally {
      state.loading = false;
    }
  };

  const isLoading = computed(() => state.loading);
  const isSuccess = computed(() => state.success);
  const hasError = computed(() => !!state.error);

  return { state, execute, isLoading, isSuccess, hasError };
}

export interface ResponsePayload<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  error?: unknown;
}

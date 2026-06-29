import { useAuthStore } from '@store/authStore';

export const handleApiError = (error: any): string => {
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Terjadi kesalahan yang tidak diketahui';
};

export const handleAuthError = (error: any): void => {
  if (error.response?.status === 401) {
    useAuthStore.getState().logout();
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

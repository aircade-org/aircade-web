import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${process.env.API}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== 'undefined'
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.API}/api/v1/auth/refresh`,
            { refreshToken },
          );

          localStorage.setItem('access_token', data.token);
          localStorage.setItem('refresh_token', data.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return apiClient(originalRequest);
        } catch (_refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');

          if (typeof window !== 'undefined') {
            window.location.href = '/signin';
          }
        }
      }
    }

    return Promise.reject(error);
  },
);

export { apiClient };

import axios from 'axios';

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'http://localhost:5000/api',

  withCredentials: true
});

/*
 * Add the saved JWT to every API request.
 *
 * The backend already supports this through:
 *
 * Authorization: Bearer <token>
 */
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'wishlink_token'
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

/*
 * If a protected request says the session
 * is invalid or expired, remove the stale token.
 */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error?.response?.status ===
      401
    ) {
      const requestUrl =
        error?.config?.url || '';

      /*
       * Do not remove anything merely because
       * the initial /auth/me check happens while
       * the user is genuinely logged out.
       *
       * If a token exists and is rejected,
       * however, it is stale and should go.
       */
      if (
        localStorage.getItem(
          'wishlink_token'
        ) &&
        requestUrl !==
          '/auth/login'
      ) {
        localStorage.removeItem(
          'wishlink_token'
        );
      }
    }

    return Promise.reject(
      error
    );
  }
);

export function getErrorMessage(
  error
) {
  return (
    error?.response?.data
      ?.message ||
    error?.message ||
    'Something went wrong.'
  );
}
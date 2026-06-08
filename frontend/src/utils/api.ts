const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  body?: any;
}

export async function apiRequest(path: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Automatic logout on unauthorized / token expiration
      if (response.status === 401 && path !== '/auth/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error(data.message || 'Something went wrong.');
    }

    return data;
  } catch (err: any) {
    console.error(`API Request to ${path} failed:`, err);
    throw err;
  }
}

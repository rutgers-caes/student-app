const tokenStorageKey = 'itac.student.token';
const profileStorageKey = 'itac.student.profile';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload as T;
}

export const AuthServiceApi = {
  getToken() {
    return localStorage.getItem(tokenStorageKey) || '';
  },
  getStoredStudentProfile<T>() {
    const profile = localStorage.getItem(profileStorageKey);
    return profile ? (JSON.parse(profile) as T) : null;
  },
  async login(email: string, password: string) {
    const result = await request<{ token: string; temporaryPasswordRequired: boolean; student: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem(tokenStorageKey, result.token);
    localStorage.setItem(profileStorageKey, JSON.stringify(result.student));
    return result;
  },
  async requestRegistration(email: string) {
    return request<{ approved: boolean; temporaryPassword?: string; message: string }>('/auth/register/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async getMyProfile<T>() {
    const token = this.getToken();
    const profile = await request<T>('/students/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    localStorage.setItem(profileStorageKey, JSON.stringify(profile));
    return profile;
  },
  async logout() {
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(profileStorageKey);
  },
};

const tokenStorageKey = 'itac.student.token';
const profileStorageKey = 'itac.student.profile';
const cacheTtlMs = 5 * 60 * 1000;
export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/$/, '');

type StoredStudentProfile = {
  id?: string;
  firstName?: string;
  name?: string;
  photoBase64?: string;
};

type CacheEntry<T> = {
  expiresAt: number;
  promise?: Promise<T>;
  value?: T;
};

const responseCache = new Map<string, CacheEntry<unknown>>();

function getCacheKey(path: string, token = '') {
  return `${token || 'public'}:${path}`;
}

function clearCache(prefix = '') {
  if (!prefix) {
    responseCache.clear();
    return;
  }

  for (const key of responseCache.keys()) {
    if (key.includes(prefix)) responseCache.delete(key);
  }
}

async function cachedRequest<T>(path: string, options: RequestInit = {}, token = '') {
  const key = getCacheKey(path, token);
  const now = Date.now();
  const cached = responseCache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    if ('value' in cached) return cached.value as T;
    if (cached.promise) return cached.promise;
  }

  const promise = request<T>(path, options)
    .then((value) => {
      responseCache.set(key, { expiresAt: Date.now() + cacheTtlMs, value });
      return value;
    })
    .catch((error) => {
      responseCache.delete(key);
      throw error;
    });

  responseCache.set(key, { expiresAt: now + cacheTtlMs, promise });
  return promise;
}

function storeStudentProfileSnapshot(student: unknown) {
  if (!student || typeof student !== 'object') {
    localStorage.removeItem(profileStorageKey);
    return;
  }

  const profile = student as StoredStudentProfile;
  localStorage.setItem(
    profileStorageKey,
    JSON.stringify({
      id: profile.id,
      firstName: profile.firstName,
      name: profile.name,
      photoBase64: profile.photoBase64,
    }),
  );
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(tokenStorageKey);
      localStorage.removeItem(profileStorageKey);
      clearCache();
    }
    throw new Error(payload.error || payload.message || 'Request failed.');
  }

  return payload as T;
}

async function downloadFile(path: string, fallbackFilename: string, options: RequestInit = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(tokenStorageKey);
      localStorage.removeItem(profileStorageKey);
      clearCache();
    }
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || payload.message || 'Download failed.');
  }

  const blob = await response.blob();
  const filename = getFilenameFromContentDisposition(response.headers.get('Content-Disposition')) || fallbackFilename;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getFilenameFromContentDisposition(contentDisposition: string | null) {
  const match = contentDisposition?.match(/filename="([^"]+)"/);
  return match?.[1] || '';
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
    const result = await request<{ token: string; student: unknown }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem(tokenStorageKey, result.token);
    storeStudentProfileSnapshot(result.student);
    clearCache();
    return result;
  },
  async requestRegistration(email: string) {
    return request<{ approved?: boolean; directPasswordSetupAllowed?: boolean; setupToken?: string; message: string }>('/auth/register/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async getPublicJobPostingCount() {
    const result = await cachedRequest<{ count: number }>('/jobs/public/count');
    return result.count;
  },
  async completeRegistration(token: string, password: string) {
    return request<{ message: string }>('/auth/register/complete', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
  async requestPasswordReset(email: string) {
    return request<{ directPasswordSetupAllowed?: boolean; setupToken?: string; message: string }>('/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async completePasswordReset(token: string, password: string) {
    return request<{ message: string }>('/auth/password/complete', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },
  async changePassword(currentPassword: string, newPassword: string) {
    const token = this.getToken();
    return request<{ message: string }>('/students/me/password', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  async getMyProfile<T>() {
    const token = this.getToken();
    const profile = await cachedRequest<T>('/students/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, token);
    storeStudentProfileSnapshot(profile);
    return profile;
  },
  async updateMyProfile<T>(profileUpdate: Record<string, string | null>) {
    const token = this.getToken();
    const profile = await request<T>('/students/me', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileUpdate),
    });
    clearCache('/students/');
    storeStudentProfileSnapshot(profile);
    responseCache.set(getCacheKey('/students/me', token), {
      expiresAt: Date.now() + cacheTtlMs,
      value: profile,
    });
    return profile;
  },
  async downloadMyAssessments(mode: 'all' | 'lead') {
    const token = this.getToken();
    const filename = mode === 'lead' ? 'ITAC_student_lead_assessments.xlsx' : 'ITAC_student_all_assessments.xlsx';
    return downloadFile(`/students/me/assessments/${mode}.xlsx`, filename, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  async getAssessmentMetrics<T>(mode: 'all' | 'lead') {
    const token = this.getToken();
    return cachedRequest<T>(`/students/me/assessments/${mode}/metrics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, token);
  },
  async getStudentProfile<T>(studentId: string) {
    const token = this.getToken();
    return cachedRequest<T>(`/students/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, token);
  },
  async logout() {
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(profileStorageKey);
    clearCache();
  },
};

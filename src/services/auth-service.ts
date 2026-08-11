const tokenStorageKey = 'itac.student.token';
const profileStorageKey = 'itac.student.profile';
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

type StoredStudentProfile = {
  id?: string;
  firstName?: string;
  name?: string;
};

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
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
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
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || 'Download failed.');
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
    return result;
  },
  async requestRegistration(email: string) {
    return request<{ approved?: boolean; directPasswordSetupAllowed?: boolean; setupToken?: string; message: string }>('/auth/register/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
  async getPublicJobPostingCount() {
    const result = await request<{ count: number }>('/jobs/public/count');
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
    const profile = await request<T>('/students/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    storeStudentProfileSnapshot(profile);
    return profile;
  },
  async updateMyProfile<T>(profileUpdate: Record<string, string>) {
    const token = this.getToken();
    const profile = await request<T>('/students/me', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileUpdate),
    });
    storeStudentProfileSnapshot(profile);
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
  async getStudentProfile<T>(studentId: string) {
    const token = this.getToken();
    return request<T>(`/students/${studentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
  async logout() {
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(profileStorageKey);
  },
};

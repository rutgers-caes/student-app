import { apiBaseUrl, AuthServiceApi } from "@/services/auth-service";
import { errorToast, successToast } from "@/utils/toasts.js";

export const API_BASE_URL = apiBaseUrl;

// API endpoint constants
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER_REQUEST: "/auth/register/request",
    REGISTER_COMPLETE: "/auth/register/complete",
    PASSWORD_FORGOT: "/auth/password/forgot",
    PASSWORD_COMPLETE: "/auth/password/complete",
  },
  STUDENT: {
    GET_ME: "/students/me",
    UPDATE_ME: "/students/me",
    CHANGE_PASSWORD: "/students/me/password",
    GET_BY_ID: (studentId: string) => `/students/${studentId}`,
    DOWNLOAD_ALL_ASSESSMENTS: "/students/me/assessments/all.xlsx",
    DOWNLOAD_LEAD_ASSESSMENTS: "/students/me/assessments/lead.xlsx",
  },
};

export const getHeadersWithAuth = (
  options: RequestInit = {},
  multipart: boolean = false,
) => {
  const token = AuthServiceApi.getToken();
  const response = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!multipart) {
    response["Content-Type"] = "application/json";
  }

  return response;
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  disableErrorToast: boolean = false,
  multiPart = false,
): Promise<T> => {
  const headers = getHeadersWithAuth(options, multiPart);

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  let response: Response;
  try {
    // This should be a ApiResponse, but fetch() ain't cool enough to let me infer that... ☹️
    response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw e;
    }
    console.error("Error fetching", e);
    if (!disableErrorToast) {
      errorToast("Unable to make request, please try again later");
    }
    throw new Error(`Unable to make request, please try again later: [${e}]`);
  }

  if (response.status === 401 && endpoint != API_ENDPOINTS.AUTH.LOGIN) {
    await AuthServiceApi.logout();
    throw new Error("Unauthorized");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => ({}));
  if (response.status > 201) {
    if (data.message) {
      errorToast(data.message);
      console.error("Failed with response", data);
      throw new Error(data.message);
    }
    if (data.error) {
      errorToast(data.error);
      console.error("Failed with response", data);
      throw new Error(data.error);
    }
    throw new Error("Unknown error attempting to hit API");
  } else if (data?.message) {
    successToast(data.message);
  }

  return data as T;
};

export const getApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  return await apiRequest<T>(endpoint, {
    ...options,
    method: "GET",
  });
};

export const postApiRequest = async <T>(
  endpoint: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<T> => {
  return await apiRequest<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const putApiRequest = async <T>(
  endpoint: string,
  body: unknown,
  options: RequestInit = {},
  disableErrorToast: boolean = false,
): Promise<T> => {
  return await apiRequest<T>(
    endpoint,
    {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    },
    disableErrorToast,
  );
};

export const patchApiRequest = async <T>(
  endpoint: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<T> => {
  return await apiRequest<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });
};

export const deleteApiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  return await apiRequest<T>(endpoint, {
    ...options,
    method: "DELETE",
  });
};

export const apiUploadFileRequest = async <T>(
  endpoint: string,
  file: File,
  fieldName: string = "file",
  options: RequestInit = {},
): Promise<T> => {
  const formData = new FormData();
  formData.append(fieldName, file);
  return await apiRequest<T>(
    endpoint,
    {
      ...options,
      method: "POST",
      body: formData,
    },
    false,
    true,
  );
};

type BlobErrorResponsePayload = {
  message?: string;
  error?: string;
};

const getBlobErrorMessage = (responseText: string): string | null => {
  if (!responseText) {
    return null;
  }

  try {
    const payload = JSON.parse(responseText) as BlobErrorResponsePayload;
    if (payload.message) {
      return payload.message;
    }

    if (payload.error) {
      return payload.error;
    }
  } catch {
    return responseText;
  }

  return responseText;
};

export const getApiBlob = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Blob> => {
  const headers = getHeadersWithAuth(options, false) as Record<string, string>;
  if (!headers["Accept"]) headers["Accept"] = "application/pdf";

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method: options.method ?? "GET",
      headers,
      credentials: "include",
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw e;
    }

    errorToast("Unable to make request, please try again later");
    throw new Error(`Unable to make request, please try again later: [${e}]`);
  }

  if (res.status === 401 && endpoint != API_ENDPOINTS.AUTH.LOGIN) {
    await AuthServiceApi.logout();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const responseText = await res.text();
    const message =
      getBlobErrorMessage(responseText) || `Request failed: ${res.status}`;
    errorToast(message);
    throw new Error(message);
  }

  return await res.blob();
};

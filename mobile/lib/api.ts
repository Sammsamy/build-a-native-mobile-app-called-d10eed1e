import type {
  ActionResponse,
  AnalyzeReportPayload,
  AskReportQuestionPayload,
  AskReportQuestionResponse,
  DashboardResponse,
  DeviceSessionResponse,
  ReportDetail,
  RestorePurchasesResponse,
  RuntimeUploadContract,
  UnlockReportPayload,
} from '@/types/labbuddy';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

async function apiFetch<T>(endpoint: string, options?: RequestInit, authToken?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options?.headers) {
    const providedHeaders = new Headers(options.headers);
    providedHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const payload = (await response.json()) as { detail?: string };
      if (payload.detail) {
        message = payload.detail;
      }
    } catch {
      // Ignore JSON parsing issues and use fallback message.
    }
    throw new ApiError(message, response.status);
  }

  return (await response.json()) as T;
}

export async function createDeviceSession(deviceId: string): Promise<DeviceSessionResponse> {
  return apiFetch<DeviceSessionResponse>('/labbuddy/device/session', {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId }),
  });
}

export async function getDashboard(authToken: string): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>('/labbuddy/dashboard', undefined, authToken);
}

export async function getReport(reportId: number, authToken: string): Promise<ReportDetail> {
  return apiFetch<ReportDetail>(`/labbuddy/reports/${reportId}`, undefined, authToken);
}

export async function analyzeReport(payload: AnalyzeReportPayload, authToken: string): Promise<ReportDetail> {
  return apiFetch<ReportDetail>('/labbuddy/reports/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, authToken);
}

export async function unlockReport(reportId: number, payload: UnlockReportPayload, authToken: string): Promise<ReportDetail> {
  return apiFetch<ReportDetail>(`/labbuddy/reports/${reportId}/unlock`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, authToken);
}

export async function askQuestion(
  reportId: number,
  payload: AskReportQuestionPayload,
  authToken: string,
): Promise<AskReportQuestionResponse> {
  return apiFetch<AskReportQuestionResponse>(`/labbuddy/reports/${reportId}/ask`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, authToken);
}

export async function acknowledgeSafety(authToken: string): Promise<ActionResponse> {
  return apiFetch<ActionResponse>('/labbuddy/device/acknowledge-safety', {
    method: 'POST',
  }, authToken);
}

export async function restorePurchases(authToken: string): Promise<RestorePurchasesResponse> {
  return apiFetch<RestorePurchasesResponse>('/labbuddy/purchases/restore', {
    method: 'POST',
  }, authToken);
}

export async function deleteAllData(authToken: string): Promise<ActionResponse> {
  return apiFetch<ActionResponse>('/labbuddy/data', {
    method: 'DELETE',
  }, authToken);
}

export async function createRuntimeUploadContract(
  filename: string,
  contentType: string,
  category = 'lab-reports',
): Promise<RuntimeUploadContract> {
  return apiFetch<RuntimeUploadContract>('/runtime-uploads/presign', {
    method: 'POST',
    body: JSON.stringify({
      filename,
      content_type: contentType,
      category,
    }),
  });
}

export async function uploadBlobToContract(contract: RuntimeUploadContract, blob: Blob): Promise<void> {
  const response = await fetch(contract.upload_url, {
    method: contract.method || 'PUT',
    headers: contract.headers,
    body: blob,
  });

  if (!response.ok) {
    throw new ApiError('Upload failed. Please try a clearer image.', response.status);
  }
}

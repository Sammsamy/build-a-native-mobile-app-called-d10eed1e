import type {
  ActionResponse,
  AnalyzeReportPayload,
  AskReportQuestionPayload,
  AskReportQuestionResponse,
  DashboardResponse,
  ReportDetail,
  RestorePurchasesResponse,
  RuntimeUploadContract,
  UnlockReportPayload,
} from '@/types/labbuddy';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
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
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function getDashboard(deviceId: string): Promise<DashboardResponse> {
  const query = new URLSearchParams({ device_id: deviceId }).toString();
  return apiFetch<DashboardResponse>(`/labbuddy/dashboard?${query}`);
}

export async function getReport(reportId: number, deviceId: string): Promise<ReportDetail> {
  const query = new URLSearchParams({ device_id: deviceId }).toString();
  return apiFetch<ReportDetail>(`/labbuddy/reports/${reportId}?${query}`);
}

export async function analyzeReport(payload: AnalyzeReportPayload): Promise<ReportDetail> {
  return apiFetch<ReportDetail>('/labbuddy/reports/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function unlockReport(reportId: number, payload: UnlockReportPayload): Promise<ReportDetail> {
  return apiFetch<ReportDetail>(`/labbuddy/reports/${reportId}/unlock`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function askQuestion(reportId: number, payload: AskReportQuestionPayload): Promise<AskReportQuestionResponse> {
  return apiFetch<AskReportQuestionResponse>(`/labbuddy/reports/${reportId}/ask`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function acknowledgeSafety(deviceId: string): Promise<ActionResponse> {
  return apiFetch<ActionResponse>('/labbuddy/device/acknowledge-safety', {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId }),
  });
}

export async function restorePurchases(deviceId: string): Promise<RestorePurchasesResponse> {
  return apiFetch<RestorePurchasesResponse>('/labbuddy/purchases/restore', {
    method: 'POST',
    body: JSON.stringify({ device_id: deviceId }),
  });
}

export async function deleteAllData(deviceId: string): Promise<ActionResponse> {
  const query = new URLSearchParams({ device_id: deviceId }).toString();
  return apiFetch<ActionResponse>(`/labbuddy/data?${query}`, {
    method: 'DELETE',
  });
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
    throw new Error('Upload failed. Please try a clearer image.');
  }
}

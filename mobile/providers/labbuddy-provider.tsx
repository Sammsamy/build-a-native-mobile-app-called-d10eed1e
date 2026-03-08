import type { PropsWithChildren } from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';
import type { DashboardResponse, ReportDetail } from '@/types/labbuddy';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Text } from '@/components/ui/Text';
import {
  acknowledgeSafety,
  analyzeReport,
  askQuestion,
  createRuntimeUploadContract,
  deleteAllData as deleteAllDataRequest,
  getDashboard,
  getReport,
  restorePurchases as restorePurchasesRequest,
  unlockReport,
  uploadBlobToContract,
} from '@/lib/api';
import {
  clearLocalLabBuddyStorage,
  getDeviceId,
  hasAcknowledgedDisclaimer,
  saveDisclaimerAcknowledgement,
} from '@/lib/device';

interface AnalyzeOptions {
  sourceType: 'camera' | 'library';
  reportLabel?: string;
  collectedOn?: string;
  isHistoricalUpload: boolean;
}

interface LabBuddyContextValue {
  deviceId: string | null;
  dashboard: DashboardResponse | null;
  reportDetails: Record<number, ReportDetail>;
  isBootstrapping: boolean;
  loadingMessage: string | null;
  refreshDashboard: () => Promise<void>;
  getReportDetail: (reportId: number) => Promise<ReportDetail>;
  analyzeAsset: (asset: ImagePickerAsset, options: AnalyzeOptions) => Promise<ReportDetail>;
  unlockSelectedReport: (reportId: number) => Promise<ReportDetail>;
  askReportQuestion: (reportId: number, question: string) => Promise<ReportDetail>;
  acknowledgeDisclaimer: () => Promise<void>;
  restorePurchases: () => Promise<string>;
  deleteAllData: () => Promise<void>;
}

const LabBuddyContext = createContext<LabBuddyContextValue | undefined>(undefined);

const LOADING_STAGES = [
  'Uploading…',
  'Reading your report…',
  'Analyzing biomarkers…',
  'Generating insights…',
  'Finalizing…',
] as const;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

async function assetToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export function LabBuddyProvider({ children }: PropsWithChildren) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [reportDetails, setReportDetails] = useState<Record<number, ReportDetail>>({});
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

  const refreshDashboard = useCallback(async () => {
    const resolvedDeviceId = deviceId ?? await getDeviceId();
    if (!deviceId) {
      setDeviceId(resolvedDeviceId);
    }
    const nextDashboard = await getDashboard(resolvedDeviceId);
    setDashboard(nextDashboard);
  }, [deviceId]);

  const bootstrap = useCallback(async () => {
    try {
      setIsBootstrapping(true);
      const resolvedDeviceId = await getDeviceId();
      const locallyAcknowledged = await hasAcknowledgedDisclaimer();
      setDeviceId(resolvedDeviceId);
      setDisclaimerVisible(!locallyAcknowledged);
      const nextDashboard = await getDashboard(resolvedDeviceId);
      setDashboard(nextDashboard);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const getReportDetail = useCallback(async (reportId: number) => {
    if (!deviceId) {
      throw new Error('LabBuddy is still loading.');
    }
    const cached = reportDetails[reportId];
    if (cached) {
      return cached;
    }
    const detail = await getReport(reportId, deviceId);
    setReportDetails((current) => ({ ...current, [reportId]: detail }));
    return detail;
  }, [deviceId, reportDetails]);

  const analyzeAsset = useCallback(async (asset: ImagePickerAsset, options: AnalyzeOptions) => {
    if (!deviceId) {
      throw new Error('LabBuddy is still loading.');
    }

    try {
      setLoadingMessage(LOADING_STAGES[0]);
      const blob = await assetToBlob(asset.uri);
      const filename = asset.fileName ?? `${options.sourceType}-${Date.now()}.jpg`;
      const contentType = asset.mimeType ?? 'image/jpeg';
      const contract = await createRuntimeUploadContract(filename, contentType, 'lab-reports');
      await uploadBlobToContract(contract, blob);

      setLoadingMessage(LOADING_STAGES[1]);
      await new Promise((resolve) => setTimeout(resolve, 250));
      setLoadingMessage(LOADING_STAGES[2]);
      await new Promise((resolve) => setTimeout(resolve, 250));
      setLoadingMessage(LOADING_STAGES[3]);

      const detail = await analyzeReport({
        device_id: deviceId,
        report_label: options.reportLabel,
        source_type: options.sourceType,
        content_type: contentType,
        original_filename: contract.original_filename,
        image_public_url: contract.public_url,
        image_object_key: contract.object_key,
        collected_on: options.collectedOn,
        is_historical_upload: options.isHistoricalUpload,
      });

      setLoadingMessage(LOADING_STAGES[4]);
      setReportDetails((current) => ({ ...current, [detail.id]: detail }));
      await refreshDashboard();
      return detail;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Couldn’t read this image clearly—try a sharper screenshot.'));
    } finally {
      setLoadingMessage(null);
    }
  }, [deviceId, refreshDashboard]);

  const unlockSelectedReport = useCallback(async (reportId: number) => {
    if (!deviceId) {
      throw new Error('LabBuddy is still loading.');
    }

    setLoadingMessage('Unlocking your full report…');
    try {
      const detail = await unlockReport(reportId, {
        device_id: deviceId,
        product_key: 'report_unlock',
      });
      setReportDetails((current) => ({ ...current, [detail.id]: detail }));
      await refreshDashboard();
      return detail;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'We couldn’t unlock this report right now. Please try again.'));
    } finally {
      setLoadingMessage(null);
    }
  }, [deviceId, refreshDashboard]);

  const askReportQuestion = useCallback(async (reportId: number, question: string) => {
    if (!deviceId) {
      throw new Error('LabBuddy is still loading.');
    }

    setLoadingMessage('Thinking through your question…');
    try {
      const response = await askQuestion(reportId, {
        device_id: deviceId,
        question,
      });
      setReportDetails((current) => ({ ...current, [reportId]: response.report }));
      await refreshDashboard();
      return response.report;
    } catch (error) {
      throw new Error(getErrorMessage(error, 'We couldn’t answer that just now. Please try again in a moment.'));
    } finally {
      setLoadingMessage(null);
    }
  }, [deviceId, refreshDashboard]);

  const acknowledgeDisclaimer = useCallback(async () => {
    if (!deviceId) {
      return;
    }
    await Promise.all([
      saveDisclaimerAcknowledgement(),
      acknowledgeSafety(deviceId),
    ]);
    setDisclaimerVisible(false);
    await refreshDashboard();
  }, [deviceId, refreshDashboard]);

  const restorePurchases = useCallback(async () => {
    if (!deviceId) {
      throw new Error('LabBuddy is still loading.');
    }
    const response = await restorePurchasesRequest(deviceId);
    await refreshDashboard();
    return response.message;
  }, [deviceId, refreshDashboard]);

  const deleteAllData = useCallback(async () => {
    if (!deviceId) {
      throw new Error('LabBuddy is still loading.');
    }
    await deleteAllDataRequest(deviceId);
    await clearLocalLabBuddyStorage();
    setDashboard(null);
    setReportDetails({});
    setDeviceId(null);
    await bootstrap();
  }, [bootstrap, deviceId]);

  const value = useMemo<LabBuddyContextValue>(() => ({
    deviceId,
    dashboard,
    reportDetails,
    isBootstrapping,
    loadingMessage,
    refreshDashboard,
    getReportDetail,
    analyzeAsset,
    unlockSelectedReport,
    askReportQuestion,
    acknowledgeDisclaimer,
    restorePurchases,
    deleteAllData,
  }), [
    acknowledgeDisclaimer,
    analyzeAsset,
    askReportQuestion,
    dashboard,
    deleteAllData,
    deviceId,
    getReportDetail,
    isBootstrapping,
    loadingMessage,
    refreshDashboard,
    reportDetails,
    restorePurchases,
    unlockSelectedReport,
  ]);

  return (
    <LabBuddyContext.Provider value={value}>
      {children}

      <Dialog visible={disclaimerVisible} onClose={() => {}}>
        <DialogContent className="mx-6 rounded-[28px]">
          <DialogHeader>
            <DialogTitle>Before you start</DialogTitle>
            <DialogDescription>
              Educational only. Not medical advice. Not for emergencies. Do not use to diagnose or treat. If severe symptoms, seek urgent care.
            </DialogDescription>
          </DialogHeader>
          <Text className="text-sm leading-6 text-text-secondary">
            LabBuddy is designed to help you understand lab reports in calmer, simpler language and prepare better questions for your clinician.
          </Text>
          <DialogFooter className="mt-5">
            <Button className="flex-1 rounded-2xl" onPress={() => void acknowledgeDisclaimer()}>
              I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog visible={loadingMessage !== null} onClose={() => {}}>
        <DialogContent className="mx-10 rounded-[28px] items-center gap-3 py-7">
          <Text className="text-base font-semibold">Working on your report</Text>
          <Text className="text-sm text-text-secondary text-center">{loadingMessage ?? ''}</Text>
        </DialogContent>
      </Dialog>
    </LabBuddyContext.Provider>
  );
}

export function useLabBuddy(): LabBuddyContextValue {
  const context = useContext(LabBuddyContext);
  if (!context) {
    throw new Error('useLabBuddy must be used within LabBuddyProvider');
  }
  return context;
}

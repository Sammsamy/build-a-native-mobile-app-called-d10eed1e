import type { ReactNode } from 'react';
import type { TrendSeries } from '@/types/labbuddy';

import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { shadows } from '@/theme/shadows';

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  normal: { bg: '#EAF7F0', text: '#2F8F5B', icon: 'checkmark-circle' },
  low: { bg: '#FFF6E6', text: '#BC7A00', icon: 'remove-circle' },
  medium: { bg: '#FFF6E6', text: '#BC7A00', icon: 'alert-circle' },
  high: { bg: '#FDEBEC', text: '#C4485F', icon: 'warning' },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function GradientHeroCard({ children }: { children: ReactNode }) {
  return (
    <View className="overflow-hidden rounded-[32px] border border-white/10" style={shadows.lg}>
      <View className="px-6 pt-6 pb-7" style={{ backgroundColor: '#F6FAFF' }}>
        <View
          className="absolute right-0 top-0 h-44 w-44 rounded-full"
          style={{ backgroundColor: '#D8E7FF', transform: [{ translateX: 46 }, { translateY: -24 }] }}
        />
        <View
          className="absolute bottom-0 left-0 h-32 w-32 rounded-full"
          style={{ backgroundColor: '#E5F8F0', transform: [{ translateX: -34 }, { translateY: 26 }] }}
        />
        <View
          className="absolute left-10 top-8 h-20 w-20 rounded-full"
          style={{ backgroundColor: '#FFFFFF88' }}
        />
        {children}
      </View>
    </View>
  );
}

export function SoftSectionCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Card className={`rounded-[28px] border border-border ${className}`}>
      <CardContent className="gap-4">{children}</CardContent>
    </Card>
  );
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  const palette = STATUS_STYLES[status] ?? STATUS_STYLES.normal;
  return (
    <View className="self-start flex-row items-center gap-2 rounded-full px-3 py-2" style={{ backgroundColor: palette.bg }}>
      <Ionicons name={palette.icon} size={14} color={palette.text} />
      <Text className="text-xs font-semibold" style={{ color: palette.text }}>{label}</Text>
    </View>
  );
}

export function InlineMetric({ label, value, valueTone = '#12243A' }: { label: string; value: string; valueTone?: string }) {
  return (
    <View className="gap-1">
      <Text className="text-xs uppercase tracking-[0.9px] text-text-tertiary">{label}</Text>
      <Text className="text-lg font-semibold tracking-[-0.2px]" style={{ color: valueTone }}>{value}</Text>
    </View>
  );
}

export function TimelineMeter({ score, caption }: { score: number; caption: string }) {
  const progress = clamp(score, 0, 1) * 100;
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold" style={{ color: '#12243A' }}>Timeline completeness</Text>
        <Text className="text-sm font-semibold" style={{ color: '#1E67FF' }}>{Math.round(progress)}%</Text>
      </View>
      <View className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: '#E3EBF6' }}>
        <View className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: '#1E67FF' }} />
      </View>
      <Text className="text-sm leading-6 text-text-secondary">{caption}</Text>
    </View>
  );
}

export function ReportTeaserCard({
  title,
  body,
  status,
  actionLabel,
  onPress,
}: {
  title: string;
  body: string;
  status: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  return (
    <SoftSectionCard>
      <View className="gap-3">
        <StatusPill status={status} label={status === 'high' ? 'Priority follow-up' : status === 'medium' ? 'Follow up soon' : 'Reassuring preview'} />
        <View className="gap-2">
          <Text className="text-lg font-semibold tracking-[-0.2px]">{title}</Text>
          <Text className="text-sm leading-6 text-text-secondary">{body}</Text>
        </View>
        {actionLabel && onPress ? (
          <Button variant="secondary" className="self-start" onPress={onPress}>{actionLabel}</Button>
        ) : null}
      </View>
    </SoftSectionCard>
  );
}

export function SparkTrend({ series }: { series: TrendSeries }) {
  const values = series.points.map((point) => point.value);
  const max = Math.max(...values, 1);

  return (
    <View className="gap-3 rounded-[24px] border border-border p-4" style={{ backgroundColor: '#F1F6FD' }}>
      <View className="flex-row items-center justify-between">
        <View className="gap-1">
          <Text className="font-semibold" style={{ color: '#12243A' }}>{series.display_name}</Text>
          <Text className="text-xs text-text-secondary">{series.unit}</Text>
        </View>
        <Text className="text-xs font-semibold text-text-secondary">{series.enough_data ? `${series.points.length} points` : 'Need 2+ reports'}</Text>
      </View>
      <View className="h-20 flex-row items-end gap-2">
        {series.points.map((point) => (
          <View key={`${series.biomarker_key}-${point.report_id}`} className="flex-1 items-center gap-2">
            <View
              className="w-full rounded-full"
              style={{ height: clamp((point.value / max) * 56, 10, 56), backgroundColor: '#78A9FF' }}
            />
            <Text className="text-[11px] text-text-tertiary">{point.collected_on ? point.collected_on.slice(2, 4) : '--'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function SettingsRow({
  icon,
  title,
  description,
  onPress,
  destructive = false,
  trailing,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress?: () => void;
  destructive?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center gap-4 rounded-[24px] border border-border p-4 active:opacity-80"
      style={{ backgroundColor: '#F1F6FD' }}
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: destructive ? '#FDEBEC' : '#EAF1FF' }}>
        <Ionicons name={icon} size={20} color={destructive ? '#C4485F' : '#1E67FF'} />
      </View>
      <View className="flex-1 gap-1">
        <Text className="font-semibold tracking-[-0.15px]" style={{ color: destructive ? '#A63249' : '#12243A' }}>{title}</Text>
        <Text className="text-sm leading-5 text-text-secondary">{description}</Text>
      </View>
      {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={18} color="#97A4B8" /> : null)}
    </Pressable>
  );
}

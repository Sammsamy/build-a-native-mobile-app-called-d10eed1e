import type { ReactNode } from 'react';
import type { TrendSeries } from '@/types/labbuddy';

import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { shadows } from '@/theme/shadows';

export const labBuddyPalette = {
  shell: '#0D1522',
  shellElevated: '#101B2B',
  shellAccent: '#9CC0FF',
  shellText: '#F7FBFF',
  shellTextSecondary: '#AEBCCD',
  surface: '#F8FBFF',
  surfaceMuted: '#F1F6FD',
  surfaceTint: '#F6FAFF',
  border: 'rgba(18, 36, 58, 0.1)',
  text: '#12243A',
  textSecondary: '#55677F',
  textTertiary: '#7E8EA4',
  primary: '#1E67FF',
  primarySoft: '#EAF1FF',
  success: '#2F8F5B',
  successSoft: '#EAF7F0',
  warning: '#BC7A00',
  warningSoft: '#FFF6E6',
  danger: '#C4485F',
  dangerSoft: '#FDEBEC',
  progressTrack: '#E3EBF6',
  whiteOverlay: '#FFFFFFD8',
} as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  normal: { bg: labBuddyPalette.successSoft, text: labBuddyPalette.success, icon: 'checkmark-circle' },
  low: { bg: labBuddyPalette.warningSoft, text: labBuddyPalette.warning, icon: 'remove-circle' },
  medium: { bg: labBuddyPalette.warningSoft, text: labBuddyPalette.warning, icon: 'alert-circle' },
  high: { bg: labBuddyPalette.dangerSoft, text: labBuddyPalette.danger, icon: 'warning' },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function ScreenHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <View className="gap-2 px-1 pb-1">
      <Text className="text-xs font-semibold uppercase tracking-[0.9px]" style={{ color: labBuddyPalette.shellAccent }}>
        {eyebrow}
      </Text>
      <Text className="text-[28px] font-semibold leading-[34px] tracking-[-0.3px]" style={{ color: labBuddyPalette.shellText }}>
        {title}
      </Text>
      <Text className="text-[15px] leading-6" style={{ color: labBuddyPalette.shellTextSecondary }}>
        {description}
      </Text>
    </View>
  );
}

export function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <View className="gap-2">
      <Text className="text-[20px] font-semibold leading-7 tracking-[-0.2px]">{title}</Text>
      {description ? <Text className="text-sm leading-6 text-text-secondary">{description}</Text> : null}
    </View>
  );
}

export function IconBadge({
  icon,
  tone = 'primary',
  size = 'md',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeStyles = {
    sm: { container: 'h-10 w-10 rounded-[16px]', icon: 18 },
    md: { container: 'h-12 w-12 rounded-[20px]', icon: 22 },
    lg: { container: 'h-14 w-14 rounded-[22px]', icon: 24 },
  } as const;

  const toneStyles = {
    primary: { backgroundColor: labBuddyPalette.primarySoft, color: labBuddyPalette.primary },
    success: { backgroundColor: labBuddyPalette.successSoft, color: labBuddyPalette.success },
    warning: { backgroundColor: labBuddyPalette.warningSoft, color: labBuddyPalette.warning },
    danger: { backgroundColor: labBuddyPalette.dangerSoft, color: labBuddyPalette.danger },
  } as const;

  const scale = sizeStyles[size];
  const palette = toneStyles[tone];

  return (
    <View className={`items-center justify-center ${scale.container}`} style={{ backgroundColor: palette.backgroundColor }}>
      <Ionicons name={icon} size={scale.icon} color={palette.color} />
    </View>
  );
}

export function SurfaceListItem({
  icon,
  children,
  tone = 'success',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
}) {
  const toneColor = {
    primary: labBuddyPalette.primary,
    success: labBuddyPalette.success,
    warning: labBuddyPalette.warning,
    danger: labBuddyPalette.danger,
  }[tone];

  return (
    <View className="flex-row items-start gap-3 rounded-[20px] border border-border bg-surface-muted px-4 py-4">
      <Ionicons name={icon} size={18} color={toneColor} style={{ marginTop: 2 }} />
      <View className="flex-1">{children}</View>
    </View>
  );
}

export function MetricTile({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-1 gap-2 rounded-[20px] border border-border px-4 py-4" style={{ backgroundColor: labBuddyPalette.whiteOverlay }}>
      <Text className="text-xs font-medium uppercase tracking-[0.8px] text-text-tertiary">{label}</Text>
      <Text className="text-2xl font-semibold leading-8 tracking-[-0.2px]" style={{ color: labBuddyPalette.text }}>
        {value}
      </Text>
    </View>
  );
}

export function GradientHeroCard({ children }: { children: ReactNode }) {
  return (
    <View className="overflow-hidden rounded-[32px] border border-white/10" style={shadows.lg}>
      <View className="px-5 pb-6 pt-6" style={{ backgroundColor: labBuddyPalette.surfaceTint }}>
        <View
          className="absolute right-0 top-0 h-44 w-44 rounded-full"
          style={{ backgroundColor: '#D8E7FF', transform: [{ translateX: 46 }, { translateY: -24 }] }}
        />
        <View
          className="absolute bottom-0 left-0 h-32 w-32 rounded-full"
          style={{ backgroundColor: '#E5F8F0', transform: [{ translateX: -34 }, { translateY: 26 }] }}
        />
        <View className="absolute left-10 top-8 h-20 w-20 rounded-full" style={{ backgroundColor: '#FFFFFF88' }} />
        {children}
      </View>
    </View>
  );
}

export function SoftSectionCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <Card className={`rounded-[24px] border border-border ${className}`}>
      <CardContent className="gap-4">{children}</CardContent>
    </Card>
  );
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  const palette = STATUS_STYLES[status] ?? STATUS_STYLES.normal;
  return (
    <View className="self-start flex-row items-center gap-2 rounded-full px-3 py-2" style={{ backgroundColor: palette.bg }}>
      <Ionicons name={palette.icon} size={14} color={palette.text} />
      <Text className="text-xs font-semibold leading-4" style={{ color: palette.text }}>
        {label}
      </Text>
    </View>
  );
}

export function InlineMetric({
  label,
  value,
  valueTone = labBuddyPalette.text,
}: {
  label: string;
  value: string;
  valueTone?: string;
}) {
  return (
    <View className="gap-1">
      <Text className="text-xs uppercase tracking-[0.8px] text-text-tertiary">{label}</Text>
      <Text className="text-lg font-semibold leading-7 tracking-[-0.15px]" style={{ color: valueTone }}>
        {value}
      </Text>
    </View>
  );
}

export function TimelineMeter({ score, caption }: { score: number; caption: string }) {
  const progress = clamp(score, 0, 1) * 100;

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-4">
        <Text className="text-sm font-semibold leading-5">Timeline completeness</Text>
        <Text className="text-sm font-semibold leading-5" style={{ color: labBuddyPalette.primary }}>
          {Math.round(progress)}%
        </Text>
      </View>
      <View className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: labBuddyPalette.progressTrack }}>
        <View className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: labBuddyPalette.primary }} />
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
      <View className="gap-4">
        <StatusPill
          status={status}
          label={status === 'high' ? 'Priority follow-up' : status === 'medium' ? 'Follow up soon' : 'Reassuring preview'}
        />
        <SectionHeading title={title} description={body} />
        {actionLabel && onPress ? (
          <Button variant="secondary" className="self-start" onPress={onPress}>
            {actionLabel}
          </Button>
        ) : null}
      </View>
    </SoftSectionCard>
  );
}

export function SparkTrend({ series }: { series: TrendSeries }) {
  const values = series.points.map((point) => point.value);
  const max = Math.max(...values, 1);

  return (
    <View className="gap-3 rounded-[20px] border border-border p-4" style={{ backgroundColor: labBuddyPalette.surfaceMuted }}>
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1 gap-1">
          <Text className="font-semibold leading-6" style={{ color: labBuddyPalette.text }}>
            {series.display_name}
          </Text>
          <Text className="text-xs leading-4 text-text-secondary">{series.unit}</Text>
        </View>
        <Text className="text-xs font-medium leading-4 text-text-secondary">
          {series.enough_data ? `${series.points.length} points` : 'Need 2+ reports'}
        </Text>
      </View>
      <View className="h-20 flex-row items-end gap-2">
        {series.points.map((point) => (
          <View key={`${series.biomarker_key}-${point.report_id}`} className="flex-1 items-center gap-2">
            <View
              className="w-full rounded-full"
              style={{ height: clamp((point.value / max) * 56, 10, 56), backgroundColor: '#78A9FF' }}
            />
            <Text className="text-[11px] leading-4 text-text-tertiary">
              {point.collected_on ? point.collected_on.slice(2, 4) : '--'}
            </Text>
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
      className="flex-row items-center gap-4 rounded-[20px] border border-border bg-surface-muted p-4 active:opacity-90"
      style={({ pressed }) => [pressed && onPress ? { transform: [{ scale: 0.99 }] } : null]}
    >
      <IconBadge icon={icon} tone={destructive ? 'danger' : 'primary'} />
      <View className="flex-1 gap-1">
        <Text className="font-semibold leading-6" style={{ color: destructive ? '#A63249' : labBuddyPalette.text }}>
          {title}
        </Text>
        <Text className="text-sm leading-6 text-text-secondary">{description}</Text>
      </View>
      {trailing ?? <Ionicons name="chevron-forward" size={18} color={labBuddyPalette.textTertiary} />}
    </Pressable>
  );
}

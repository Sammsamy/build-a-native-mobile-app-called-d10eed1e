import { View } from 'react-native';

import { Text, TextClassContext } from '@/components/ui/Text';
import { cn } from '@/lib/cn';
import { shadows } from '@/theme/shadows';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <TextClassContext.Provider value="text-text">
      <View
        className={cn('rounded-[24px] border border-border bg-surface-elevated', className)}
        style={shadows.md}
      >
        {children}
      </View>
    </TextClassContext.Provider>
  );
}

export function CardHeader({ children, className }: CardProps) {
  return <View className={cn('gap-2 px-5 pb-2 pt-5', className)}>{children}</View>;
}

export function CardTitle({ children, className }: { children: string; className?: string }) {
  return <Text className={cn('text-[20px] font-semibold leading-7 tracking-[-0.2px]', className)}>{children}</Text>;
}

export function CardDescription({ children, className }: { children: string; className?: string }) {
  return <Text className={cn('text-sm leading-6 text-text-secondary', className)}>{children}</Text>;
}

export function CardContent({ children, className }: CardProps) {
  return <View className={cn('px-5 py-5', className)}>{children}</View>;
}

export function CardFooter({ children, className }: CardProps) {
  return <View className={cn('flex-row justify-end gap-3 px-5 pb-5 pt-3', className)}>{children}</View>;
}

import type { ComponentProps } from 'react';
import type { PressableStateCallbackType, StyleProp, ViewStyle } from 'react-native';

import { Pressable, StyleSheet } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { Text, TextClassContext } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'min-h-[52px] flex-row items-center justify-center gap-2.5 rounded-[20px] px-5 py-4 active:opacity-90',
  {
    variants: {
      variant: {
        primary: 'bg-primary',
        secondary: 'border border-border bg-surface-elevated',
        destructive: 'bg-error',
        ghost: 'border border-border bg-transparent',
      },
      size: {
        default: '',
        sm: 'min-h-[44px] rounded-[16px] px-4 py-3',
        lg: 'min-h-[56px] rounded-[24px] px-6 py-4',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

const buttonTextVariants = cva('text-[15px] font-semibold leading-5 tracking-[0px]', {
  variants: {
    variant: {
      primary: 'text-on-primary',
      secondary: 'text-text',
      destructive: 'text-on-primary',
      ghost: 'text-primary',
    },
    size: {
      default: '',
      sm: 'text-sm leading-5',
      lg: 'text-base leading-6',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
});

const buttonStyles = StyleSheet.create({
  primary: {
    shadowColor: '#0E3D8A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  secondary: {
    shadowColor: '#09121E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
  },
  destructive: {
    shadowColor: '#7D2436',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
  },
  ghost: {},
  pressed: {
    transform: [{ scale: 0.985 }],
  },
});

type ButtonProps = ComponentProps<typeof Pressable> & VariantProps<typeof buttonVariants>;

function Button({ children, variant, size, className, disabled, style, ...props }: ButtonProps) {
  const resolvedVariant = variant ?? 'primary';
  const textClass = buttonTextVariants({ variant: resolvedVariant, size });

  function resolveStyle(state: PressableStateCallbackType): StyleProp<ViewStyle> {
    const userStyle = typeof style === 'function' ? style(state) : style;

    return [buttonStyles[resolvedVariant], state.pressed && !disabled ? buttonStyles.pressed : null, userStyle];
  }

  return (
    <TextClassContext.Provider value={textClass}>
      <Pressable
        disabled={disabled}
        className={cn(buttonVariants({ variant: resolvedVariant, size }), disabled && 'opacity-50', className)}
        style={resolveStyle}
        {...props}
      >
        {typeof children === 'string' ? <Text className={textClass}>{children}</Text> : children}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };

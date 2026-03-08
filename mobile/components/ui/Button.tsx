import { Pressable, StyleSheet } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { Text, TextClassContext } from '@/components/ui/Text';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'min-h-[56px] flex-row items-center justify-center gap-2 rounded-[22px] px-6 active:opacity-80',
  {
    variants: {
      variant: {
        primary: 'bg-primary',
        secondary: 'bg-surface border border-border',
        destructive: 'bg-error',
        ghost: 'bg-transparent border border-border',
      },
      size: {
        default: 'py-4',
        sm: 'min-h-[44px] py-2.5 px-4 rounded-2xl',
        lg: 'min-h-[60px] py-4.5 px-8 rounded-[24px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva('font-semibold tracking-[-0.15px]', {
  variants: {
    variant: {
      primary: 'text-on-primary',
      secondary: 'text-text',
      destructive: 'text-on-primary',
      ghost: 'text-primary',
    },
    size: {
      default: 'text-[15px]',
      sm: 'text-sm',
      lg: 'text-base',
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
    shadowOpacity: 0.18,
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
    shadowOpacity: 0.14,
    shadowRadius: 18,
  },
  ghost: {},
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants>;

function Button({ children, variant, size, className, disabled, style, ...props }: ButtonProps) {
  const resolvedVariant = variant ?? 'primary';
  const textClass = buttonTextVariants({ variant: resolvedVariant, size });

  return (
    <TextClassContext.Provider value={textClass}>
      <Pressable
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: resolvedVariant, size }),
          disabled && 'opacity-50',
          className,
        )}
        style={[buttonStyles[resolvedVariant], style]}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text className={textClass}>{children}</Text>
        ) : (
          children
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'lime';

const variantClass: Record<Variant, string> = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--ghost',
  ghost: 'btn btn--ghost',
  lime: 'btn btn--lime',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
};

export function Button({
  variant = 'primary',
  fullWidth,
  className = '',
  style,
  children,
  ...rest
}: Props) {
  return (
    <button
      type="button"
      className={`${variantClass[variant]} ${className}`.trim()}
      style={{ ...(fullWidth ? { width: '100%' } : {}), ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

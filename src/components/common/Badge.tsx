import type { HTMLAttributes, ReactNode } from 'react';

type Props = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Badge({ children, className = '', ...rest }: Props) {
  return (
    <span className={`chip ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}

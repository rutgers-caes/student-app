import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type CardProps<TElement extends ElementType = 'div'> = {
  as?: TElement;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<TElement>, 'as' | 'className' | 'children'>;

export function Card<TElement extends ElementType = 'div'>({
  as,
  children,
  className = '',
  ...props
}: CardProps<TElement>) {
  const Component = as || 'div';

  return (
    <Component
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}

import React from 'react';

export default function FormRow({ children }: { children: React.ReactNode }) {
  // Tailwind bug
  const supportedVariants = [
    'grid-cols-1 md:grid-cols-0 ',
    'grid-cols-1 md:grid-cols-1 ',
    'grid-cols-1 md:grid-cols-2 ',
    'grid-cols-1 md:grid-cols-3 ',
    'grid-cols-1 md:grid-cols-4 ',
    'grid-cols-1 md:grid-cols-5 ',
    'grid-cols-1 md:grid-cols-6 ',
  ];
  const colCount = React.Children.count(children); // Calculate the number of children

  return (
    <div
      className={
        'grid ' +
        (supportedVariants[colCount] || '') +
        'gap-4 md:gap-6 mb-3 md:mb-1'
      }
    >
      {children}
    </div>
  );
}

'use client';

import type { ComponentPropsWithoutRef } from 'react';

type ClientImageProps = ComponentPropsWithoutRef<'img'>;

export default function ClientImage({ onError, ...props }: ClientImageProps) {
  const handleError: ClientImageProps['onError'] = (event) => {
    event.currentTarget.style.display = 'none';
    onError?.(event);
  };

  return <img {...props} onError={handleError} />;
}

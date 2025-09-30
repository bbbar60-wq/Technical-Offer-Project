'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 5000,
        style: {
          background: '#FFFFFF', // surface color
          color: '#0F1724', // neutral-900
          boxShadow: '0 6px 18px rgba(15, 23, 36, 0.1)',
          borderRadius: '8px',
        },
        success: {
            iconTheme: {
                primary: '#10B981', // success
                secondary: 'white',
            },
        },
        error: {
            iconTheme: {
                primary: '#EF4444', // danger
                secondary: 'white',
            },
        },
      }}
    />
  );
}

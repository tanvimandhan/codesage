// src/trpc/react.ts
// src/trpc/react.ts
'use client'

import { QueryClient } from '@tanstack/react-query';
import {QueryClientProvider } from '@tanstack/react-query';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/api/root';
import { useState } from 'react';
import superjson from 'superjson';
import { httpBatchLink } from '@trpc/client';

export const api = createTRPCReact<AppRouter>();

interface TRPCReactProviderProps {
  children: React.ReactNode;
}
export function TRPCReactProvider({ children }: TRPCReactProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}
import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'NexusCommerce | E-Commerce Order Management Platform',
  description: 'Enterprise Order Management Platform powered by FastAPI, Celery, Redis, PostgreSQL, Docker, and Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

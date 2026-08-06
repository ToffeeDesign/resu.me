'use client';

import React from 'react';
import { LoginModal } from '@/components/Auth/LoginModal';
import { ResumeProvider } from '@/context/ResumeContext';
import { DashboardPage } from '@/views/DashboardPage/DashboardPage';

export default function Home() {
  return (
    <ResumeProvider>
      <DashboardPage />
      <LoginModal />
    </ResumeProvider>
  );
}

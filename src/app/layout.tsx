import type { Metadata } from 'next';
import './globals.css';
import AgentationWrapper from '@/components/AgentationWrapper';

export const metadata: Metadata = {
  title: 'ResumeAI — AI-Powered Resume Builder for GCC & India',
  description:
    'Build ATS-optimized, professional resumes in minutes. Perfect for job seekers in UAE, Saudi Arabia, India, and beyond. AI-powered tools to land your dream job.',
  keywords: ['resume builder', 'AI resume', 'ATS resume', 'UAE jobs', 'India resume', 'cover letter generator'],
  openGraph: {
    title: 'ResumeAI — Premium AI Resume Builder',
    description: 'Build professional, ATS-optimized resumes in minutes with AI assistance.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <AgentationWrapper />
      </body>
    </html>
  );
}

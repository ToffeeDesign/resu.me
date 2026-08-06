'use client';

import React from 'react';
import { ResumeData } from '@/context/ResumeContext';
import { ResumePreview } from '@/components/ResumePreview/ResumePreview';

interface Props { data: ResumeData }

export const ResumeThumbnail: React.FC<Props> = ({ data }) => {
  return <ResumePreview data={data} isThumbnail={true} />;
};


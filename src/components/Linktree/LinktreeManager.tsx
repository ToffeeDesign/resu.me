import React, { useState } from 'react';
import { useResume, LinktreePage } from '@/context/ResumeContext';
import { LinktreeEmptyState } from './LinktreeEmptyState';
import { LinktreeDashboard } from './LinktreeDashboard';
import { LinktreeBuilder } from './LinktreeBuilder';
import styles from './LinktreeManager.module.css';

interface LinktreeManagerProps {
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
  editingPageId: string | null;
  setEditingPageId: (id: string | null) => void;
}

export function LinktreeManager({ 
  isCreating, 
  setIsCreating, 
  editingPageId, 
  setEditingPageId 
}: LinktreeManagerProps) {
  const { linktreePages, saveLinktreePage, deleteLinktreePage, user, triggerLogin } = useResume();

  const handleCreatePage = (slug: string) => {
    const authUserStr = typeof window !== 'undefined' ? localStorage.getItem('auth_user_v1') : null;
    const authUser = authUserStr ? JSON.parse(authUserStr) : null;
    const isLoggedIn = !!authUser;

    // Check if user is logged in before allowing creation
    if (!isLoggedIn) {
      triggerLogin(() => {
        handleCreatePage(slug);
      });
      return;
    }

    const displayName = 'Your Name';
    const avatarUrl = authUser?.avatarUrl || authUser?.image || '';

    const newPage: LinktreePage = {
      id: `lt-${Date.now()}`,
      slug: slug.trim().toLowerCase(),
      displayName: displayName,
      bio: '',
      avatarUrl: avatarUrl,
      theme: {
        backgroundType: 'solid',
        backgroundValue: '#ffffff',
        fontFamily: 'Inter',
        blockRadius: 20,
        blockShadow: true,
        accentColor: '#6e7cfa',
        textColor: '#1f2937'
      },
      blocks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveLinktreePage(newPage);
    setIsCreating(false);
    setEditingPageId(newPage.id); // Go straight into editing the new page!
  };

  const handleCancelCreate = () => {
    if (linktreePages.length > 0) {
      setIsCreating(false);
    }
  };

  const handleEdit = (page: LinktreePage) => {
    setEditingPageId(page.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this Linktree page?')) {
      deleteLinktreePage(id);
    }
  };

  // Redundant render block deleted.
  // Parent component DashboardPage.tsx handles rendering of LinktreeBuilder when editingPageId is active.

  return (
    <div className={styles.container}>
      {(linktreePages.length === 0 || isCreating) ? (
        <LinktreeEmptyState 
          onCreatePage={handleCreatePage} 
          onCancel={linktreePages.length > 0 ? handleCancelCreate : undefined}
        />
      ) : (
        <LinktreeDashboard 
          pages={linktreePages} 
          onEdit={handleEdit}
          onDelete={handleDelete} 
          onCreateNew={() => setIsCreating(true)}
        />
      )}
    </div>
  );
}

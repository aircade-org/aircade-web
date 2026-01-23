'use client';

import { use } from 'react';

import { ControllerSession } from '@/components/controller/controller-session';
import { JoinForm } from '@/components/controller/join-form';

import { useSessionStore } from '@/store/session';

interface JoinPageProps {
  params: Promise<{ sessionCode: string }>;
}

export default function JoinPage({ params }: JoinPageProps) {
  const { sessionCode } = use(params);
  const currentPlayer = useSessionStore((s) => s.currentPlayer);

  if (currentPlayer) {
    return <ControllerSession />;
  }

  return <JoinForm defaultSessionCode={sessionCode.toUpperCase()} />;
}

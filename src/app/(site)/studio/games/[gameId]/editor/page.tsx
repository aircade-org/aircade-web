'use client';

import { useParams } from 'next/navigation';

import { StudioEditor } from '@/components/studio/studio-editor';

export default function EditorPage() {
  const params = useParams<{ gameId: string }>();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <StudioEditor gameId={params.gameId} />
    </div>
  );
}

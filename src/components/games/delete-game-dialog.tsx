'use client';

import { useState } from 'react';

import { toast } from 'sonner';

import type { Game } from '@/types/game';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { useGameStore } from '@/store/game';

interface DeleteGameDialogProps {
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteGameDialog({
  game,
  open,
  onOpenChange,
}: DeleteGameDialogProps) {
  const deleteGame = useGameStore((s) => s.deleteGame);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGame(game.id);
      toast.success('Game deleted.');
      onOpenChange(false);
    } catch (_err) {
      toast.error('Failed to delete game.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete &ldquo;{game.title}&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the game and all its assets. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

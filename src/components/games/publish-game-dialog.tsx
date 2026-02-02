'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { Game } from '@/types/game';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import {
  type PublishGameInput,
  publishGameSchema,
} from '@/lib/validations/game';

import { useGameStore } from '@/store/game';

interface PublishGameDialogProps {
  game: Game;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PublishGameDialog({
  game,
  open,
  onOpenChange,
}: PublishGameDialogProps) {
  const publishGame = useGameStore((s) => s.publishGame);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PublishGameInput>({
    resolver: zodResolver(publishGameSchema),
    defaultValues: { changelog: '' },
  });

  const onSubmit = async (values: PublishGameInput) => {
    setIsSubmitting(true);
    try {
      await publishGame(game.id, values);
      toast.success('Game published!');
      onOpenChange(false);
      form.reset();
    } catch (_err) {
      toast.error(
        'Failed to publish game. Make sure your game has a title and code.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFirstPublish = game.publishedVersionId === null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isFirstPublish ? 'Publish Game' : 'Publish New Version'}
          </DialogTitle>
          <DialogDescription>
            {isFirstPublish
              ? 'Publishing will make your game available to players. A snapshot of your current code will be saved.'
              : 'A new version snapshot will be created from your current code.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="changelog"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Changelog</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What changed in this version? (optional)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe what&apos;s new or changed in this version.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing…' : 'Publish'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

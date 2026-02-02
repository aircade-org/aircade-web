'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import type { Game, Tag } from '@/types/game';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

import { type UpdateGameInput, updateGameSchema } from '@/lib/validations/game';

import { useGameStore } from '@/store/game';

interface GameSettingsFormProps {
  game: Game;
}

export function GameSettingsForm({ game }: GameSettingsFormProps) {
  const updateGame = useGameStore((s) => s.updateGame);
  const getTags = useGameStore((s) => s.getTags);
  const setGameTags = useGameStore((s) => s.setGameTags);
  const getGameTags = useGameStore((s) => s.getGameTags);

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingTags, setIsSavingTags] = useState(false);

  const form = useForm<UpdateGameInput>({
    resolver: zodResolver(updateGameSchema),
    defaultValues: {
      title: game.title,
      description: game.description ?? '',
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      visibility: game.visibility,
      remixable: game.remixable,
    },
  });

  useEffect(() => {
    const loadTags = async () => {
      try {
        const [tags, gameTags] = await Promise.all([
          getTags(),
          getGameTags(game.id),
        ]);
        setAllTags(tags);
        setSelectedTagIds(gameTags.map((t) => t.id));
      } catch (_err) {
        // ignore
      } finally {
        setTagsLoading(false);
      }
    };
    loadTags();
  }, [game.id, getTags, getGameTags]);

  const onSubmit = async (values: UpdateGameInput) => {
    setIsSaving(true);
    try {
      await updateGame(game.id, values);
      toast.success('Settings saved.');
    } catch (_err) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTags = async () => {
    setIsSavingTags(true);
    try {
      await setGameTags(game.id, selectedTagIds);
      toast.success('Tags saved.');
    } catch (_err) {
      toast.error('Failed to save tags.');
    } finally {
      setIsSavingTags(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const tagsByCategory = allTags.reduce<Record<string, Tag[]>>((acc, tag) => {
    const category = acc[tag.category] ?? [];
    return { ...acc, [tag.category]: [...category, tag] };
  }, {});

  const categoryLabels: Record<string, string> = {
    genre: 'Genre',
    mood: 'Mood',
    playerStyle: 'Player Style',
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div>
            <h2 className="text-lg font-semibold">Game Details</h2>
            <p className="text-muted-foreground text-sm">
              Basic information about your game.
            </p>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minPlayers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Players</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxPlayers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Players</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div>
            <h2 className="text-lg font-semibold">Visibility & Sharing</h2>
          </div>

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="private">Private — only you</SelectItem>
                    <SelectItem value="unlisted">
                      Unlisted — anyone with the link
                    </SelectItem>
                    <SelectItem value="public">
                      Public — visible in library
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remixable"
            render={({ field }) => (
              <FormItem className="flex items-start space-y-0 space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Allow remixing</FormLabel>
                  <FormDescription>
                    Other creators can fork your published game and build on it.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : 'Save Settings'}
          </Button>
        </form>
      </Form>

      <Separator />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Tags</h2>
          <p className="text-muted-foreground text-sm">
            Help players discover your game.
          </p>
        </div>

        {tagsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-7 w-20 rounded-full"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(tagsByCategory).map(([category, tags]) => (
              <div key={category}>
                <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                  {categoryLabels[category] ?? category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected = selectedTagIds.includes(tag.id);
                    return (
                      <Badge
                        key={tag.id}
                        variant={selected ? 'default' : 'outline'}
                        className="cursor-pointer select-none"
                        onClick={() => toggleTag(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          onClick={handleSaveTags}
          disabled={isSavingTags || tagsLoading}
          variant="outline"
        >
          {isSavingTags ? 'Saving tags…' : 'Save Tags'}
        </Button>
      </div>
    </div>
  );
}

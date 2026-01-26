'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Gamepad2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  type JoinSessionInput,
  joinSessionSchema,
} from '@/lib/validations/session';

import { useSessionStore } from '@/store/session';

interface JoinFormProps {
  defaultSessionCode?: string;
}

export function JoinForm({ defaultSessionCode }: JoinFormProps) {
  const joinSession = useSessionStore((s) => s.joinSession);
  const isConnecting = useSessionStore((s) => s.isConnecting);

  const form = useForm<JoinSessionInput>({
    resolver: zodResolver(joinSessionSchema),
    defaultValues: {
      sessionCode: defaultSessionCode ?? '',
      displayName: '',
    },
  });

  const onSubmit = async (data: JoinSessionInput) => {
    try {
      await joinSession(data.sessionCode, data.displayName);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to join session.',
      );
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-1 flex justify-center sm:mb-2">
            <Gamepad2 className="text-muted-foreground size-8 sm:size-10" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Join Game</CardTitle>
          <CardDescription className="text-sm">
            Enter the session code shown on the big screen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3 sm:space-y-4"
            >
              <FormField
                control={form.control}
                name="sessionCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Session Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XKCD42"
                        className="h-11 text-center font-mono text-base tracking-widest uppercase sm:h-10 sm:text-lg"
                        maxLength={6}
                        autoComplete="off"
                        autoCapitalize="characters"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        className="h-11 sm:h-10"
                        maxLength={30}
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isConnecting}
                className="h-11 w-full sm:h-10"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Joining…
                  </>
                ) : (
                  'Join Session'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

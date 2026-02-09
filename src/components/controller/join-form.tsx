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
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center">
            <Gamepad2 className="text-muted-foreground size-10" />
          </div>
          <CardTitle>Join Game</CardTitle>
          <CardDescription>
            Enter the session code shown on the big screen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="sessionCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XKCD42"
                        className="text-center font-mono text-lg tracking-widest uppercase"
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
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
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
                className="w-full"
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

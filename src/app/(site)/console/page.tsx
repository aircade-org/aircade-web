import { Tv } from 'lucide-react';

export default function ConsolePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <Tv className="text-muted-foreground mb-4 size-12" />
      <h1 className="text-2xl font-bold">Console</h1>
      <p className="text-muted-foreground mt-2">
        The big screen game lobby is coming soon.
      </p>
    </div>
  );
}

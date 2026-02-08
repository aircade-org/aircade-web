import { Code } from 'lucide-react';

export default function StudioPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <Code className="text-muted-foreground mb-4 size-12" />
      <h1 className="text-2xl font-bold">Creative Studio</h1>
      <p className="text-muted-foreground mt-2">
        The browser-based game editor is coming soon.
      </p>
    </div>
  );
}

import { Gamepad2 } from 'lucide-react';

export default function ControllerPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <Gamepad2 className="text-muted-foreground mb-4 size-12" />
      <h1 className="text-2xl font-bold">Controller</h1>
      <p className="text-muted-foreground mt-2">
        The smartphone controller is coming soon.
      </p>
    </div>
  );
}

import { Droplets } from "lucide-react";

export function Header() {
  return (
    <header className="px-4 sm:px-6 lg:px-8 py-4 border-b">
      <div className="flex items-center gap-2">
        <Droplets className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight font-headline">
          AquaControl IoT
        </h1>
      </div>
    </header>
  );
}

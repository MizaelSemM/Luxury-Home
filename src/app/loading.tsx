import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-graphite-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-bronze-500 animate-spin" />
    </div>
  );
}

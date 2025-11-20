import { VoiceRecorder } from '@/components/features/voice-recorder';
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <VoiceRecorder />
      <Toaster />
    </main>
  );
}

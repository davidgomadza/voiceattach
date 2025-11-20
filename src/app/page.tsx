import { VoiceRecorder } from '@/components/features/voice-recorder';
import { Toaster } from "@/components/ui/toaster";
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <VoiceRecorder />
      <Toaster />
      <Link href="/voiceattach/index.html" className="mt-4 text-primary underline">
        View VoiceAttach HTML
      </Link>
    </main>
  );
}

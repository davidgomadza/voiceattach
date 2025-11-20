"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Download, Mail, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function VoiceRecorder() {
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  const getMicrophonePermission = async () => {
    if (!("MediaRecorder" in window)) {
      toast({
        variant: "destructive",
        title: "Unsupported Browser",
        description: "The MediaRecorder API is not available in your browser.",
      });
      return;
    }
    try {
      const streamData = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setPermission(true);
      setStream(streamData);
    } catch (err) {
      if (err instanceof Error) {
        toast({
          variant: "destructive",
          title: "Microphone Access Denied",
          description: "Please allow microphone access in your browser settings to use this feature.",
        });
      }
      setPermission(false);
    }
  };
  
  useEffect(() => {
    if(!permission) {
      getMicrophonePermission();
    }
  }, [permission]);

  const startRecording = () => {
    if (!stream || !permission) {
      toast({
        variant: "destructive",
        title: "Microphone not ready",
        description: "Could not start recording. Please ensure microphone access is allowed.",
      });
      getMicrophonePermission();
      return;
    }
    
    setIsRecording(true);
    setAudioURL(null); // Clear previous recording
    setRecordingTime(0);

    timerIntervalRef.current = setInterval(() => {
      setRecordingTime(prevTime => prevTime + 1);
    }, 1000);

    const media = new MediaRecorder(stream, { mimeType: "audio/webm" });
    mediaRecorder.current = media;
    mediaRecorder.current.start();

    let localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined" || event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) return;

    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);
      setAudioChunks([]);
      toast({
        title: "Recording complete!",
        description: "You can now play, download, or email your recording.",
      });
    };
  };

  const resetRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setIsRecording(false);
    setRecordingTime(0);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  useEffect(() => {
    // Cleanup URL object when component unmounts
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const renderMainButton = () => {
    if (!permission) {
      return (
        <Button onClick={getMicrophonePermission} size="lg" className="w-full">
          <Mic className="mr-2 h-4 w-4" /> Allow Microphone
        </Button>
      );
    }

    if (isRecording) {
      return (
        <Button onClick={stopRecording} variant="destructive" size="lg" className="w-full">
          <Square className="mr-2 h-4 w-4" /> Stop Recording
        </Button>
      );
    }

    if (!isRecording && !audioURL) {
      return (
        <Button onClick={startRecording} size="lg" className="w-full">
          <Mic className="mr-2 h-4 w-4" /> Start Recording
        </Button>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full max-w-md shadow-2xl bg-card">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
          <div className="p-4 bg-accent/50 rounded-full">
             <Mic className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl font-headline text-primary">VoiceAttach</CardTitle>
        <CardDescription>Record, Download, Attach.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 pt-2">
        
        <div className="h-20 w-full flex items-center justify-center bg-muted/50 rounded-lg p-4">
          {isRecording && (
            <div className="text-center">
              <p className="text-5xl font-mono font-bold text-destructive animate-pulse">{formatTime(recordingTime)}</p>
            </div>
          )}
          {!isRecording && audioURL && (
            <audio src={audioURL} controls className="w-full" />
          )}
          {!isRecording && !audioURL && (
            <p className="text-muted-foreground">Click the record button to begin.</p>
          )}
        </div>
        
        <div className="w-full space-y-2">
          {renderMainButton()}
          
          {audioURL && (
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="outline">
                <a href={audioURL} download="voice_recording.webm">
                  <Download className="mr-2 h-4 w-4" /> Download
                </a>
              </Button>
               <Button asChild>
                  <a href="mailto:a@agt8000.life?subject=BUY%20LIFE%20EXTEND%20YOUR%20LIFE%20EASILY%20PAY%20ONLY%20US%24100%20FOR%20THE%20AGT8000%20WORTH%20US%248.4trillion&body=This%20is%20my%20proof%20of%20purchase%3A%20Amount%20Paid.......................................%0AName.........................%0AFor%20faster%20delivery%20provide%20your%20voice%20sample%20as%20mp3.%20Record%20using%20your%20smartphone%20and%20send%20then%20receive%20instantly." >
                    <Mail className="mr-2 h-4 w-4" /> Email
                  </a>
                </Button>
            </div>
          )}

          {audioURL && (
            <Button onClick={resetRecording} variant="secondary" className="w-full">
              <RotateCw className="mr-2 h-4 w-4" /> Record Again
            </Button>
          )}
        </div>
        
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground text-center w-full">
          Your recordings are private and processed in your browser.
        </p>
      </CardFooter>
    </Card>
  );
}

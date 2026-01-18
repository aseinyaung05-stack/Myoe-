
import React, { useState, useRef, useEffect } from 'react';
import { User, VoiceNote } from '../../types';
import { STRINGS } from '../../constants';
import { processVoiceAudio, connectLiveTranscription } from '../../services/geminiService';
import { saveNote } from '../../services/storageService';

interface RecordViewProps {
  user: User;
}

const RecordView: React.FC<RecordViewProps> = ({ user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const liveSessionRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      stopAllStreams();
    };
  }, []);

  const stopAllStreams = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (liveSessionRef.current) {
      liveSessionRef.current.then((session: any) => session.close());
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Visualizer
      setupVisualizer(stream);

      // Setup Live Transcription
      const sessionPromise = connectLiveTranscription({
        onTranscription: (text) => setLiveTranscript(text),
        onError: (err) => console.error("Live transcription error:", err)
      });
      liveSessionRef.current = sessionPromise;

      // Audio Context for Live Stream
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = audioCtx.createMediaStreamSource(stream);
      const scriptProcessor = audioCtx.createScriptProcessor(4096, 1, 1);
      
      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
          int16[i] = inputData[i] * 32768;
        }
        const base64 = encode(new Uint8Array(int16.buffer));
        sessionPromise.then(session => {
          session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
        });
      };

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioCtx.destination);

      // Setup Main Recorder (for final processing)
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          await handleProcessAudio(base64Audio);
        };
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setLiveTranscript("");
      setTimer(0);
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopAllStreams();
    }
  };

  const setupVisualizer = (stream: MediaStream) => {
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyzer = audioCtx.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgb(99, 102, 241)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const handleProcessAudio = async (base64: string) => {
    setIsProcessing(true);
    try {
      const result = await processVoiceAudio(base64, user.id);
      if (result) {
        saveNote({
          ...result as VoiceNote,
          audioDuration: timer
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setTimer(0);
      setLiveTranscript("");
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Base64 helper
  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
          {isRecording ? "အသံဖမ်းယူနေပါသည်" : STRINGS.MY.record_nav}
        </h2>
        <p className="text-gray-500 font-medium max-w-xs mx-auto">
          Gemini AI က သင့်စကားများကို အချိန်နှင့်တပြေးညီ နားထောင်နေပါသည်
        </p>
      </div>

      <div className="w-full max-w-md h-32 mb-12 overflow-hidden flex items-center justify-center">
        {isRecording ? (
          <canvas ref={canvasRef} width={400} height={100} className="w-full h-full opacity-60" />
        ) : (
          <div className="flex gap-1 h-4 items-center">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-1.5 h-full bg-gray-200 rounded-full"></div>
            ))}
          </div>
        )}
      </div>

      <div className="relative mb-12">
        <div className={`absolute -inset-8 bg-indigo-500 rounded-full opacity-10 transition-all duration-700 ${isRecording ? 'scale-150 animate-pulse' : 'scale-100'}`}></div>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative z-10 w-56 h-56 rounded-full flex flex-col items-center justify-center text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] transition-all transform active:scale-95 duration-500 ${
            isRecording ? 'bg-rose-500' : 'bg-indigo-600'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed scale-90' : 'hover:scale-105'}`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mb-3"></div>
              <span className="text-xs font-bold tracking-widest uppercase">Processing</span>
            </div>
          ) : (
            <>
              <div className={`transition-transform duration-500 ${isRecording ? 'rotate-90' : 'rotate-0'}`}>
                <svg className="w-20 h-20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isRecording ? (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H10a1 1 0 01-1-1v-4z" />
                  ) : (
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </div>
              <span className="font-black text-xl tracking-wide">{isRecording ? "ရပ်မည်" : "စမည်"}</span>
            </>
          )}
        </button>
      </div>

      <div className="w-full max-w-2xl px-4 text-center h-24 flex flex-col items-center justify-center">
        {isRecording ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            <div className="text-4xl font-black text-gray-900 tabular-nums mb-4">{formatTime(timer)}</div>
            <p className="text-indigo-600 font-bold bg-indigo-50 px-6 py-2 rounded-full inline-block shadow-sm">
              {liveTranscript || "အသံဖမ်းယူရန် စောင့်ဆိုင်းနေပါသည်..."}
            </p>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-indigo-600 font-black animate-pulse text-lg">{STRINGS.MY.processing}</p>
            <p className="text-xs text-gray-400">Gemini 3 Pro က သင့်အတွက် အကောင်းဆုံး ပြင်ဆင်နေပါသည်</p>
          </div>
        ) : (
          <div className="text-gray-400 text-sm italic">
            "လုပ်ငန်းခွင် အစည်းအဝေး မှတ်တမ်း" သို့မဟုတ် "ဒီနေ့ လုပ်ရမယ့်အလုပ်တွေ" ဟု စမ်းသပ်ပြောကြည့်ပါ
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordView;

import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decodeAudioData, pcmToBlob } from '../utils/audioUtils';
import { MODELS, SYSTEM_INSTRUCTIONS } from '../constants';

const LiveSpeaking: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState("Ready to start Speaking Test");
  
  // Audio Refs
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const handleStart = async () => {
    try {
      setStatus("Connecting to examiner...");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;
      nextStartTimeRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputSource = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);

      const sessionPromise = ai.live.connect({
        model: MODELS.SPEAKING_LIVE,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } }, 
          },
          systemInstruction: SYSTEM_INSTRUCTIONS.SPEAKING_EXAMINER,
        },
        callbacks: {
          onopen: () => {
            setConnected(true);
            setStatus("Connected! The examiner is listening.");
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const blob = pcmToBlob(inputData, 16000);
              sessionPromise.then(session => session.sendRealtimeInput({ media: blob }));
            };
            
            inputSource.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
               // Handle Audio Playback
               const bytes = new Uint8Array(atob(audioData).split('').map(c => c.charCodeAt(0)));
               const buffer = await decodeAudioData(bytes, outputCtx, 24000, 1);
               
               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
               
               const source = outputCtx.createBufferSource();
               source.buffer = buffer;
               source.connect(outputCtx.destination);
               source.start(nextStartTimeRef.current);
               
               nextStartTimeRef.current += buffer.duration;
               sourcesRef.current.add(source);
               source.onended = () => sourcesRef.current.delete(source);
            }
            
            if (msg.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setConnected(false);
            setStatus("Test finished.");
          },
          onerror: (e) => {
            console.error(e);
            setStatus("Connection error.");
          }
        }
      });
      
    } catch (err) {
      console.error("Failed to start:", err);
      setStatus("Error accessing microphone or connecting.");
    }
  };

  const handleStop = () => {
    inputContextRef.current?.close();
    outputContextRef.current?.close();
    setConnected(false);
    setStatus("Session ended.");
    // Note: Live API doesn't have a clean "disconnect" method exposed easily on the promise without abort controller 
    // but closing audio contexts stops the flow. In a full app, we'd manage the socket closer.
    window.location.reload(); // Hard reset for demo purposes to clear audio locks
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">IELTS Speaking Mock Test (Live)</h2>
      <div className="bg-blue-50 p-4 rounded-md mb-6">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> This uses Gemini Live API. You will speak directly to the AI Examiner. 
          The test has 3 parts. Ensure your microphone is enabled.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${connected ? 'border-green-500 animate-pulse' : 'border-gray-300'}`}>
           <span className="text-4xl">🎙️</span>
        </div>
        
        <p className="text-lg font-medium text-gray-700">{status}</p>

        {!connected ? (
          <button 
            onClick={handleStart}
            className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition shadow-md"
          >
            Start Speaking Test
          </button>
        ) : (
          <button 
            onClick={handleStop}
            className="px-8 py-3 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 transition shadow-md"
          >
            End Test
          </button>
        )}
      </div>
    </div>
  );
};

export default LiveSpeaking;

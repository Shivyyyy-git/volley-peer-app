
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Prompt } from '../types';
import { connectToLiveSession } from '../services/geminiService';
import { createBlob } from '../utils/audioUtils';
import { detectRiskWords } from '../utils/monitoringUtils';
// LiveServerMessage and LiveSession are loaded dynamically from @google/genai
import { signalingService } from '../services/signalingService';

const prompts: Prompt[] = [
    { question: "To start, what was a personal or professional win for you this past week?", speakerTurn: "Peer A" },
    { question: "That's great to hear. Peer B, how about you? What was a win for you?", speakerTurn: "Peer B" },
    { question: "Now, let's talk about challenges. Peer A, what's one challenge you're currently facing?", speakerTurn: "Peer A" },
    { question: "And for you, Peer B?", speakerTurn: "Peer B" },
    { question: "Thinking about those challenges, what's one small step you could each take to move forward? Let's start with Peer A.", speakerTurn: "Peer A" },
    { question: "Peer B, your thoughts on a small step?", speakerTurn: "Peer B" },
    { question: "Finally, what is the key takeaway for each of you from our session today? Peer A, you first.", speakerTurn: "Peer A" },
    { question: "And Peer B, your key takeaway?", speakerTurn: "Peer B" },
];

interface SessionViewProps {
  onEndSession: (transcript: string) => void;
}

type SessionStatus = 'idle' | 'creatingLink' | 'waitingForPeer' | 'joining' | 'connected' | 'error';


const UserVideo: React.FC<{
  name: string;
  stream: MediaStream | null;
  isMuted: boolean;
}> = ({ name, stream, isMuted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-brand-gray-800 rounded-lg overflow-hidden flex items-center justify-center border-2 border-brand-gray-700">
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover transform -scale-x-100" // Mirror effect for self-view
        />
      ) : (
        <div className="flex flex-col items-center animate-pulse">
            <svg className="w-24 h-24 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            <p className="text-brand-gray-400 mt-2">{name === 'Peer A (You)' || name === 'You' ? 'Waiting to start...' : 'Waiting for peer...'}</p>
        </div>
      )}
      <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white px-3 py-1 text-sm rounded-tr-lg">
        {name}
      </div>
    </div>
  );
};


const BotMessage: React.FC<{ prompt: Prompt }> = ({ prompt }) => (
    <div className="bg-brand-gray-700 rounded-lg p-6 text-center shadow-lg">
        <div className="flex items-center justify-center mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center mr-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-brand-light">Kelly is asking...</h2>
        </div>
        <p className="text-brand-gray-200 text-lg mb-4">{prompt.question}</p>
        <p className="text-brand-primary font-semibold">{prompt.speakerTurn}, please answer.</p>
    </div>
);

const SessionMetrics: React.FC<{
    riskAlert: string | null;
    onDismissAlert: () => void;
}> = ({ riskAlert, onDismissAlert }) => (
    <div className="w-full max-w-4xl mx-auto space-y-3">
        {riskAlert && (
            <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-300 px-4 py-3 rounded-lg relative text-center" role="alert">
                <span className="block sm:inline">{riskAlert}</span>
                <button onClick={onDismissAlert} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Dismiss alert">
                    <svg className="fill-current h-6 w-6 text-yellow-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        )}
        <div className="bg-brand-gray-700 rounded-lg p-4 flex items-center justify-between gap-4">
             <div className="flex items-center gap-2">
                <span className="font-medium text-brand-gray-300">Session Status:</span>
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-400 font-semibold">Live</span>
            </div>
        </div>
    </div>
);

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const SessionView: React.FC<SessionViewProps> = ({ onEndSession }) => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionLink, setSessionLink] = useState('');
  const [isPeerA, setIsPeerA] = useState(false);

  const [riskAlert, setRiskAlert] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isEndingRef = useRef(false);
  const transcriptRef = useRef(transcript);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const endSession = useCallback(() => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    console.log("Ending session...");

    localStream?.getTracks().forEach(track => track.stop());
    remoteStream?.getTracks().forEach(track => track.stop());
    
    pcRef.current?.close();
    pcRef.current = null;
    signalingService.close();

    sessionPromiseRef.current?.then(session => session.close()).catch(console.error);
    mediaStreamSourceRef.current?.disconnect();
    scriptProcessorRef.current?.disconnect();
    inputAudioContextRef.current?.close().catch(console.error);
    
    onEndSession(transcriptRef.current.join('\n'));
  }, [localStream, remoteStream, onEndSession]);

   const setupPeerConnection = useCallback((stream: MediaStream) => {
    if (pcRef.current) {
      console.log('Closing existing peer connection before creating new one');
      pcRef.current.close();
    }
    
    pcRef.current = new RTCPeerConnection(STUN_SERVERS);
    console.log('Created new RTCPeerConnection');

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        signalingService.send({
          type: 'candidate',
          candidate: event.candidate,
          sessionId: sessionIdRef.current,
        });
      } else {
        console.log('ICE gathering complete');
      }
    };

    pcRef.current.ontrack = (event) => {
        console.log('✅ Received remote track! Streams:', event.streams.length);
        if (event.streams && event.streams[0]) {
          console.log('Setting remote stream with', event.streams[0].getTracks().length, 'tracks');
          setRemoteStream(event.streams[0]);
          // Don't set status here - let it be set when answer is received or connection state changes
        }
    };
    
    pcRef.current.onconnectionstatechange = () => {
      const state = pcRef.current?.connectionState;
      console.log('Peer connection state changed:', state);
      if (state === 'connected') {
        console.log('✅ Peer connection is connected!');
        setSessionStatus('connected');
      } else if (state === 'failed' || state === 'disconnected') {
        console.error('❌ Peer connection failed/disconnected:', state);
        setError('Connection failed. Please try again.');
        setSessionStatus('error');
      }
    };

    console.log('Adding local tracks to peer connection. Stream has', stream.getTracks().length, 'tracks');
    stream.getTracks().forEach(track => {
        console.log('Adding track:', track.kind, track.id);
        pcRef.current?.addTrack(track, stream);
    });
    console.log('All local tracks added to peer connection');
  }, []);

  const startAILiveSession = useCallback(async (stream: MediaStream) => {
    inputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    const source = inputAudioContextRef.current.createMediaStreamSource(stream);
    mediaStreamSourceRef.current = source;
    
    const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
    scriptProcessorRef.current = processor;

    sessionPromiseRef.current = connectToLiveSession({
        onOpen: () => console.log("Gemini session opened."),
        onMessage: async (message: any) => {
            if (message.serverContent?.inputTranscription?.text) {
                const text = message.serverContent.inputTranscription.text;
                setTranscript(prev => [...prev, `You: ${text}`]);
                const detectedRisk = detectRiskWords(text);
                if (detectedRisk && !riskAlert) {
                    setRiskAlert(`Privacy Alert: Detected potentially sensitive term "${detectedRisk}".`);
                }
            }
            if (message.serverContent?.outputTranscription?.text) {
                const text = message.serverContent.outputTranscription.text;
                setTranscript(prev => [...prev, `Kelly: ${text}`]);
            }
        },
        onError: (e) => {
            console.error("Gemini session error:", e);
            setError("A connection error occurred with the AI service.");
        },
        onClose: () => console.log("Gemini session closed.")
    });

    processor.onaudioprocess = (audioProcessingEvent) => {
        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
        const pcmBlob = createBlob(inputData);
        sessionPromiseRef.current?.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        }).catch(err => {
            console.warn('Could not send audio data; session may be closed.', err);
        });
    };
    source.connect(processor);
    processor.connect(inputAudioContextRef.current.destination);
  }, [riskAlert]);

  const handleSignalingMessage = useCallback(async (data: any) => {
    console.log('handleSignalingMessage called with:', data.type, 'Has PC:', !!pcRef.current, 'Has Stream:', !!localStream);
    
    if (!pcRef.current || !localStream) {
      console.warn('Cannot handle signaling message: peer connection or local stream not ready', { hasPC: !!pcRef.current, hasStream: !!localStream });
      return;
    }

    console.log('Handling signaling message:', data.type);

    switch (data.type) {
        case 'offer':
            try {
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await pcRef.current.createAnswer();
              await pcRef.current.setLocalDescription(answer);
              signalingService.send({ type: 'answer', answer, sessionId: sessionIdRef.current });
              console.log('Sent answer, setting status to connected');
              setSessionStatus('connected');
            } catch (e) {
              console.error('Error handling offer:', e);
              setError('Failed to establish connection');
            }
            break;
        case 'answer':
            try {
              await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
              console.log('Received answer, setting status to connected');
              setSessionStatus('connected');
            } catch (e) {
              console.error('Error handling answer:', e);
              setError('Failed to establish connection');
            }
            break;
        case 'candidate':
            if (data.candidate) {
                try {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                    console.log('Added ICE candidate');
                } catch (e) {
                    console.error('Error adding received ice candidate', e);
                }
            }
            break;
        default:
            console.log('Unknown signaling message type:', data.type);
            break;
    }
  }, [localStream]);

  const createSession = useCallback(async () => {
    setSessionStatus('creatingLink');
    setError(null);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        setIsPeerA(true);

        await signalingService.connect();
        const newSessionId = Math.random().toString(36).substring(2, 9);
        sessionIdRef.current = newSessionId;
        const link = `${window.location.href.split('#')[0]}#${newSessionId}`;
        setSessionLink(link);
        
        // Set up message handler BEFORE sending create message
        signalingService.onMessage(async (data) => {
            console.log('Peer A received signaling message:', data.type);
            
            if (data.type === 'peer-joined' && data.sessionId === sessionIdRef.current) {
                console.log("Peer joined, creating offer...");
                setupPeerConnection(stream);
                // Wait a bit for peer connection to be ready
                await new Promise(resolve => setTimeout(resolve, 200));
                if (pcRef.current) {
                    try {
                      const offer = await pcRef.current.createOffer();
                      await pcRef.current.setLocalDescription(offer);
                      signalingService.send({ type: 'offer', offer, sessionId: sessionIdRef.current });
                      console.log('✅ Peer A sent offer to peer');
                    } catch (e) {
                      console.error('Error creating offer:', e);
                      setError('Failed to create connection offer');
                      setSessionStatus('error');
                    }
                } else {
                  console.error('Peer connection not ready after setup');
                  setError('Failed to create peer connection');
                  setSessionStatus('error');
                }
                startAILiveSession(stream);
            } else if (data.type === 'answer') {
              // Handle answer directly (don't rely on handleSignalingMessage closure)
              if (!pcRef.current) {
                console.warn('Peer A: PC not ready for answer, waiting...');
                let retries = 0;
                while (!pcRef.current && retries < 20) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                  retries++;
                }
              }
              if (pcRef.current) {
                try {
                  console.log('Peer A handling answer...');
                  await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                  console.log('✅ Peer A received answer, setting status to connected');
                  setSessionStatus('connected');
                } catch (e) {
                  console.error('Error handling answer:', e);
                  setError('Failed to establish connection');
                  setSessionStatus('error');
                }
              } else {
                console.error('Peer A: PC still not ready after waiting');
                setError('Peer connection not ready');
                setSessionStatus('error');
              }
            } else if (data.type === 'candidate' && data.candidate) {
              // Handle ICE candidate directly
              if (pcRef.current) {
                try {
                  await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                  console.log('Peer A added ICE candidate');
                } catch (e) {
                  console.error('Error adding ICE candidate:', e);
                }
              } else {
                console.warn('Peer A: PC not ready for ICE candidate');
              }
            }
        });
        
        // Now send the create message after handler is set up
        await signalingService.send({ type: 'create', sessionId: newSessionId });
        console.log('Sent create message for session:', newSessionId);
        
        setSessionStatus('waitingForPeer');

    } catch (err) {
      console.error("Error creating session.", err);
      setError("Could not access camera/microphone. Please check permissions.");
      setSessionStatus('error');
    }
  }, [setupPeerConnection, startAILiveSession]);

  const joinSession = useCallback(async (sessionId: string) => {
    setSessionStatus('joining');
    setError(null);
    setPendingSessionId(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsPeerA(false);
      
      sessionIdRef.current = sessionId;
      await signalingService.connect();
      
      // Set up peer connection first
      setupPeerConnection(stream);
      
      // Wait for peer connection to be ready
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!pcRef.current) {
        throw new Error('Peer connection failed to initialize');
      }
      
      // Create a message handler that uses the stream directly (not from closure)
      signalingService.onMessage(async (data) => {
        console.log('Peer B received signaling message:', data.type);
        
        if (data.type === 'peer-joined') {
          console.log('Peer B ignoring peer-joined message (that\'s for Peer A)');
          return;
        }
        
        // Wait for peer connection to be ready if needed
        if (!pcRef.current) {
          console.warn('Peer B: PC not ready, waiting...');
          let retries = 0;
          while (!pcRef.current && retries < 20) {
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
          }
          if (!pcRef.current) {
            console.error('Peer B: Still not ready after waiting');
            setError('Peer connection failed to initialize');
            setSessionStatus('error');
            return;
          }
        }
        
        // Handle offer directly (don't rely on handleSignalingMessage closure)
        if (data.type === 'offer') {
          try {
            console.log('Peer B handling offer...');
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            signalingService.send({ type: 'answer', answer, sessionId: sessionIdRef.current });
            console.log('✅ Peer B sent answer, setting status to connected');
            setSessionStatus('connected');
          } catch (e) {
            console.error('Error handling offer:', e);
            setError('Failed to establish connection');
            setSessionStatus('error');
          }
        } else if (data.type === 'answer') {
          // Shouldn't happen for Peer B, but handle it
          try {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            console.log('Peer B received answer (unexpected)');
            setSessionStatus('connected');
          } catch (e) {
            console.error('Error handling answer:', e);
          }
        } else if (data.type === 'candidate' && data.candidate) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            console.log('Peer B added ICE candidate');
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      });
      
      // Now send join message
      await signalingService.send({ type: 'join', sessionId });
      console.log('Peer B sent join message for session:', sessionId);

    } catch (err) {
      console.error("Error joining session.", err);
      setError("Could not access camera/microphone or join the session.");
      setSessionStatus('error');
    }
  }, [setupPeerConnection]);

  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
        const sessionId = window.location.hash.substring(1);
        if (sessionId && sessionStatus === 'idle') {
            // Don't auto-join, just show the join button
            setPendingSessionId(sessionId);
        } else if (!sessionId) {
            setPendingSessionId(null);
        }
    };
    handleHashChange(); // Check on initial load
    window.addEventListener('hashchange', handleHashChange);
    return () => {
        window.removeEventListener('hashchange', handleHashChange);
    };
  }, [sessionStatus]);
  
  const nextPrompt = useCallback(() => {
    if(currentPromptIndex < prompts.length - 1) {
        setCurrentPromptIndex(prev => prev + 1);
    } else {
        endSession();
    }
  }, [currentPromptIndex, endSession]);

  const copyLink = () => {
      navigator.clipboard.writeText(sessionLink).then(() => {
          alert('Session link copied to clipboard!');
      });
  };

  const renderContent = () => {
      // Show join button if there's a pending session ID
      if (pendingSessionId && sessionStatus === 'idle') {
          return (
             <div className="text-center p-6 bg-brand-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold text-white">Join Peer Session</h2>
                <p className="text-brand-gray-400 mt-2 mb-6">You've been invited to join a peer accountability session.</p>
                <button
                    onClick={() => joinSession(pendingSessionId)}
                    className="bg-brand-primary text-white font-semibold px-8 py-4 rounded-full hover:bg-indigo-500 transition-colors text-lg"
                >
                    Join Call
                </button>
            </div>
          );
      }
      
      if (sessionStatus === 'waitingForPeer') {
          return (
             <div className="text-center p-6 bg-brand-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold text-white">Your session is ready!</h2>
                <p className="text-brand-gray-400 mt-2 mb-6">Share this link with your peer to start.</p>
                <div className="flex items-center justify-center gap-2 p-2 bg-brand-gray-900 rounded-md">
                    <input type="text" readOnly value={sessionLink} className="bg-transparent text-white w-full outline-none" />
                    <button onClick={copyLink} className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-500">Copy</button>
                </div>
                 <p className="text-brand-gray-400 mt-6 animate-pulse">Waiting for your peer to join...</p>
            </div>
          );
      }
      if (sessionStatus === 'joining') {
          return (
             <div className="text-center p-6 bg-brand-gray-800 rounded-lg">
                <h2 className="text-xl font-semibold text-white">Joining session...</h2>
                <p className="text-brand-gray-400 mt-2 animate-pulse">Please wait while we connect you.</p>
            </div>
          );
      }
      if (sessionStatus === 'connected') {
           return (
            <div className="flex flex-col items-center gap-4">
                <SessionMetrics 
                    riskAlert={riskAlert}
                    onDismissAlert={() => setRiskAlert(null)}
                />
                <BotMessage prompt={prompts[currentPromptIndex]} />
                {isPeerA && (
                    <button 
                        onClick={nextPrompt}
                        className="bg-brand-secondary text-white font-semibold px-8 py-3 rounded-full hover:bg-green-500 transition-colors"
                    >
                        {currentPromptIndex < prompts.length - 1 ? "Next Question" : "Finish Session"}
                    </button>
                )}
            </div>
         );
      }
      return (
        <div className="text-center p-6 bg-brand-gray-800 rounded-lg">
            <h2 className="text-xl font-semibold text-white">Ready for your peer session?</h2>
            <p className="text-brand-gray-400 mt-2 mb-6">Create a link to start a session with your peer, moderated by Kelly.</p>
        </div>
      );
  }

  return (
    <div className="flex flex-col h-screen p-4 gap-4 bg-brand-dark">
        <header className="flex-shrink-0 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Volley Peer Session</h1>
            <div>
                 {sessionStatus === 'idle' && (
                    <button
                        onClick={createSession}
                        className="bg-brand-primary text-white font-semibold px-6 py-3 rounded-full hover:bg-indigo-500 transition-colors"
                    >
                        Create Session Link
                    </button>
                    )}
                 {sessionStatus === 'connected' && (
                    <button
                        onClick={endSession}
                        className="bg-red-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-red-500 transition-colors"
                    >
                        End Session
                    </button>
                )}
            </div>
        </header>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 text-red-300 rounded-lg text-center">
            {error}
        </div>
      )}

      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserVideo name={isPeerA ? "Peer A (You)" : "You"} isMuted={true} stream={localStream} />
        <UserVideo name={isPeerA ? "Peer B" : "Peer A"} isMuted={false} stream={remoteStream} />
      </div>

      <footer className="flex-shrink-0">
         {renderContent()}
      </footer>
    </div>
  );
};

export default SessionView;
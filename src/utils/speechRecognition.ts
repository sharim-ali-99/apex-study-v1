/**
 * Web Speech Recognition helper with graceful fallback
 */

export interface SpeechRecognitionResultHandler {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function startListening(handlers: SpeechRecognitionResultHandler) {
  if (!isSpeechRecognitionSupported()) {
    handlers.onError('Speech recognition is not supported in this browser.');
    handlers.onEnd();
    return null;
  }

  try {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      handlers.onResult(currentTranscript);
    };

    recognition.onerror = (event: any) => {
      handlers.onError(event.error || 'Speech recognition failed');
    };

    recognition.onend = () => {
      handlers.onEnd();
    };

    recognition.start();
    return recognition;
  } catch (err: any) {
    handlers.onError(err.message || 'Failed to initialize speech recognition');
    handlers.onEnd();
    return null;
  }
}

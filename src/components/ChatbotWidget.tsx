import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, 
  Task, 
  TimetableSlot, 
  AIActionItem 
} from '../types';
import { askAIAssistant } from '../utils/aiAssistant';
import { isSpeechRecognitionSupported, startListening } from '../utils/speechRecognition';
import { 
  Sparkles, 
  X, 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  RefreshCw
} from 'lucide-react';

interface ChatbotWidgetProps {
  tasks: Task[];
  timetable: TimetableSlot[];
  onExecuteActions: (actions: AIActionItem[]) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  tasks,
  timetable,
  onExecuteActions,
  isOpen,
  setIsOpen
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I can schedule periods, extract assignments from uploaded documents, or add tasks.\n\n• "Schedule Physics Lab on Tuesday at 2 PM"\n• "Add homework Calculus Problem Set due Friday high priority"\n• Or upload a photo of your timetable or syllabus notes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ name: string; type: string; dataUrl: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionInstanceRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text || (selectedImage ? `Attached file: ${selectedImage.name}` : ''),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    const currentAttachment = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
      const currentDate = new Date().toISOString().split('T')[0];

      const response = await askAIAssistant(
        text,
        currentAttachment ? { name: currentAttachment.name, dataUrl: currentAttachment.dataUrl } : undefined,
        {
          tasks,
          timetable,
          currentDate,
          currentDay: todayName
        }
      );

      if (response.actions && response.actions.length > 0) {
        onExecuteActions(response.actions);
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionsPerformed: response.actions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'Unable to process request right now. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionInstanceRef.current) {
        recognitionInstanceRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      const simulatedVoiceCommands = [
        'Add Physics Lab Report due Friday high priority',
        'Schedule Advanced Calculus on Monday 9 AM in Hall B',
        'Add Homework CS Graph algorithms due tomorrow',
        'Clear completed tasks'
      ];
      const randomCommand = simulatedVoiceCommands[Math.floor(Math.random() * simulatedVoiceCommands.length)];
      
      setIsListening(true);
      setSpeechTranscript('Listening...');
      setTimeout(() => {
        setSpeechTranscript(`"${randomCommand}"`);
        setTimeout(() => {
          setIsListening(false);
          setInputText(randomCommand);
          handleSendMessage(randomCommand);
        }, 1000);
      }, 900);
      return;
    }

    setIsListening(true);
    setSpeechTranscript('Listening...');

    const recognition = startListening({
      onResult: (transcript) => {
        setSpeechTranscript(transcript);
        setInputText(transcript);
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    recognitionInstanceRef.current = recognition;
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        name: file.name,
        type: file.type,
        dataUrl: reader.result as string
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 md:w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-screen sticky top-0 z-40 select-none animate-fade-in">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Study Copilot
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setMessages([
              {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: 'Chat cleared. Standing by for commands or schedule scans.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ])}
            title="Clear Chat"
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            title="Close Assistant"
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] rounded-lg p-2.5 text-xs leading-relaxed ${
                isUser
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium'
                  : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
              }`}>
                {msg.attachment && (
                  <div className="mb-2 rounded overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={msg.attachment.dataUrl} alt="attachment" className="max-h-28 w-full object-cover" />
                    <div className="p-1 text-[10px] font-mono truncate bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {msg.attachment.name}
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-normal">
                  {msg.content}
                </div>

                {msg.actionsPerformed && msg.actionsPerformed.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    {msg.actionsPerformed.map((act, i) => (
                      <div key={i} className="flex items-center space-x-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{act.summary}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] font-mono text-slate-400 px-1 mt-0.5">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Processing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Status Bar */}
      {isListening && (
        <div className="p-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-700 dark:text-slate-200">
          <div className="flex items-center space-x-2">
            <Mic className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-mono text-[11px]">{speechTranscript}</span>
          </div>
          <button
            onClick={toggleVoiceInput}
            className="text-[10px] uppercase font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Attachment Staged Preview */}
      {selectedImage && (
        <div className="p-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300 font-mono text-[11px]">
            {selectedImage.name}
          </span>
          <button
            onClick={() => setSelectedImage(null)}
            className="text-slate-400 hover:text-rose-500 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-1"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload schedule, syllabus, or note photo"
            className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleVoiceInput}
            title="Voice Command"
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isListening ? 'text-rose-500' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type command or question..."
            className="flex-1 px-2.5 py-1.5 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />

          <button
            type="submit"
            disabled={isLoading || (!inputText.trim() && !selectedImage)}
            className="p-1.5 rounded bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-30 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};

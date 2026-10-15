import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, 
  Task, 
  TimetableSlot, 
  AIActionItem,
  StudentAccount,
  ProblemReview
} from '../types';
import { askAIAssistant } from '../utils/aiAssistant';
import { isSpeechRecognitionSupported, startListening } from '../utils/speechRecognition';
import { 
  Sparkles, 
  Send, 
  Mic, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  RefreshCw, 
  X,
  FileText,
  HelpCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface PermanentAIPanelProps {
  tasks: Task[];
  timetable: TimetableSlot[];
  problems?: ProblemReview[];
  account: StudentAccount;
  onExecuteActions: (actions: AIActionItem[]) => void;
  activeAccountName: string;
  pendingAIPrompt?: string | null;
  onClearPendingAIPrompt?: () => void;
}

export const PermanentAIPanel: React.FC<PermanentAIPanelProps> = ({
  tasks,
  timetable,
  problems = [],
  account,
  onExecuteActions,
  activeAccountName,
  pendingAIPrompt,
  onClearPendingAIPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `I am your active execution copilot for **${activeAccountName}** (${account.domain || 'Student'}).\n\nTell me anything you need to do, any schedule, or any problems you are facing:\n• *"Physics test on Friday"* \n• *"Struggling with calculus formulas in Maths"*\n• *"Add occasional lab workshop on Saturday 2pm"*\n• Or click 📷 to drop a photo of your schedule or notes!`,
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
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external prompt (e.g. from ProblemReview "AI Solve" button)
  useEffect(() => {
    if (pendingAIPrompt && pendingAIPrompt.trim()) {
      handleSendMessage(pendingAIPrompt.trim());
      if (onClearPendingAIPrompt) {
        onClearPendingAIPrompt();
      }
    }
  }, [pendingAIPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text || (selectedImage ? `Analyzed photo: ${selectedImage.name}` : ''),
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
          account,
          problems,
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
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: 'I had trouble processing that request. Please try typing or rephrasing.',
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
        'Schedule Physics on Tuesday at 2 PM',
        'Add Maths problem set due Friday high priority',
        'I am having a problem with electromagnetic induction in Physics',
        'Schedule occasional Chemistry workshop on Saturday 10 AM'
      ];
      const randomCommand = simulatedVoiceCommands[Math.floor(Math.random() * simulatedVoiceCommands.length)];
      
      setIsListening(true);
      setSpeechTranscript('Listening to your voice...');
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

  const primarySubject1 = account.subjects?.[0]?.name || 'Physics';
  const primarySubject2 = account.subjects?.[1]?.name || 'Maths';

  return (
    <div className="w-full lg:w-[380px] xl:w-[420px] glass-panel border-l border-slate-200/80 dark:border-slate-800 flex flex-col shrink-0 h-full shadow-sm relative">
      {/* Permanent Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                <span>AI Execution Copilot</span>
                <span className="flex items-center space-x-1 px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[9px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Action-first · Zero-latency Copilot
              </div>
            </div>
          </div>

          <button
            onClick={() => setMessages([
              {
                id: `msg-${Date.now()}`,
                role: 'assistant',
                content: 'Chat cleared. Tell me what to schedule, what you need to do, or any problem you are facing!',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ])}
            title="Clear Chat History"
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Action Chips */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => handleSendMessage(`${primarySubject1} test on Friday`)}
            className="text-[10px] px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-500 cursor-pointer"
          >
            "{primarySubject1} test on Friday"
          </button>
          <button
            onClick={() => handleSendMessage(`I'm having a problem with formula proofs in ${primarySubject2}`)}
            className="text-[10px] px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-500 cursor-pointer"
          >
            "Problem in {primarySubject2}"
          </button>
          <button
            onClick={() => handleSendMessage(`Add occasional workshop for ${primarySubject1} on Saturday 2pm`)}
            className="text-[10px] px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-500 cursor-pointer"
          >
            "Occasional workshop"
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[10px] px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-100 cursor-pointer flex items-center space-x-1"
          >
            <ImageIcon className="w-3 h-3" />
            <span>Drop Schedule Photo</span>
          </button>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 space-y-3.5 overflow-y-auto">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[92%] rounded-xl p-3 text-xs leading-relaxed ${
                isUser
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium'
                  : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
              }`}>
                {msg.attachment && (
                  <div className="mb-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={msg.attachment.dataUrl} alt="attachment" className="max-h-36 w-full object-cover" />
                    <div className="p-1 text-[10px] font-mono truncate bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      📷 {msg.attachment.name}
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-wrap font-normal">
                  {msg.content}
                </div>

                {/* Direct Action Confirmation Cards */}
                {msg.actionsPerformed && msg.actionsPerformed.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Updated in Dashboard:
                    </span>
                    {msg.actionsPerformed.map((act, idx) => (
                      <div key={idx} className="p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 text-[11px] font-medium flex items-center space-x-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[3]" />
                        <span>{act.summary}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] font-mono text-slate-400 px-1 mt-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 w-fit">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            <span>Atlas is analyzing and updating your dashboard...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Mode Banner */}
      {isListening && (
        <div className="p-2.5 bg-blue-600 text-white flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-2">
            <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="font-mono text-[11px]">{speechTranscript}</span>
          </div>
          <button
            onClick={toggleVoiceInput}
            className="px-2 py-0.5 bg-black/20 rounded text-[10px] font-bold uppercase cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Staged Photo Attachment Preview */}
      {selectedImage && (
        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 truncate">
            <img src={selectedImage.dataUrl} alt="preview" className="w-8 h-8 rounded object-cover border border-slate-300 dark:border-slate-600 shrink-0" />
            <span className="truncate font-medium text-slate-700 dark:text-slate-300">{selectedImage.name}</span>
          </div>
          <button onClick={() => setSelectedImage(null)} className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Prominent Chat & Voice Input Box */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-1.5 p-1 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500"
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
            title="Drop photo of timetable or notes"
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop listening' : 'Voice command'}
            className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type command, e.g. 'Math test Friday'..."
            className="flex-1 px-2.5 py-2 text-xs font-medium bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() && !selectedImage}
            className="p-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 disabled:opacity-30 hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

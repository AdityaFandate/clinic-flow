import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Bot, Loader2, Send, Volume2, VolumeX } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';
import { useSpeech } from '@/hooks/useSpeech';
import { getGeminiResponse } from '@/lib/gemini';
import { toast } from 'sonner';

export function VoiceAssistantWidget() {
  const { voiceWidgetOpen, toggleVoiceWidget } = useUIStore();
  const { isListening, startListening, stopListening, speak, setTranscript: setSpeechTranscript } = useSpeech();
  
  const [language, setLanguage] = useState<Language>('english');
  const [isSpeakEnabled, setIsSpeakEnabled] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, aiResponse, processing]);

  // Initial greeting when widget opens or language changes
  useEffect(() => {
    if (voiceWidgetOpen && !transcript && !aiResponse && !processing) {
      const greetings = {
        english: "Hello! I am Aarogya, your Clinic Assistant. How can I help you today?",
        hindi: "नमस्ते! मैं आरोग्य हूँ, आपकी क्लिनिक सहायक। आज मैं आपकी क्या सहायता कर सकती हूँ?",
        marathi: "नमस्कार! मी आरोग्य आहे, तुमची क्लिनिक सहाय्यक. आज मी तुम्हाला कशी मदत करू शकतो?"
      };
      
      const greeting = greetings[language as keyof typeof greetings] || greetings.english;
      setAiResponse(greeting);
      
      if (isSpeakEnabled) {
        speak(greeting, language);
      }
    }
  }, [voiceWidgetOpen, language]);

  const handleProcessInput = async (text: string) => {
    if (!text.trim()) return;
    
    setTranscript(text);
    setUserInput('');
    setProcessing(true);
    setAiResponse('');

    try {
      const result = await getGeminiResponse(text, '', language);
      setAiResponse(result.response);
      
      // ── Voice Action Dispatch ──
      // If Gemini detected a booking/cancel/reschedule intent, dispatch a custom event
      if (result.action && result.action.type) {
        console.log('[VoiceAssistant] Action detected:', result.action);
        window.dispatchEvent(new CustomEvent('clinic:voice-action', {
          detail: result.action,
        }));
      }

      // Auto-update language if detected (and it's not an error)
      if (result.language && ['english', 'hindi', 'marathi'].includes(result.language.toLowerCase())) {
        const detectedLang = result.language.toLowerCase() as Language;
        if (detectedLang !== language) {
          setLanguage(detectedLang);
        }
      }

      // Speak the response if enabled (unless it's an error)
      if (result.language !== 'error') {
        if (isSpeakEnabled) {
          speak(result.response, result.language || language);
        }
      } else {
        toast.error("AI Assistant encountered an error.");
      }
    } catch (error) {
      toast.error("Failed to get response from AI assistant.");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setTranscript('');
      setAiResponse('');
      startListening((text) => {
        handleProcessInput(text);
      }, language);
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessInput(userInput);
  };

  if (!voiceWidgetOpen) {
    return (
      <Button
        onClick={toggleVoiceWidget}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Mic className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 border-border shadow-xl overflow-hidden flex flex-col max-h-[500px]">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">ClinicOS Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSpeakEnabled(!isSpeakEnabled)} 
              className={cn(
                "p-1.5 rounded-full hover:bg-accent transition-colors",
                isSpeakEnabled ? "text-primary" : "text-muted-foreground"
              )}
              title={isSpeakEnabled ? "Mute Voice" : "Enable Voice"}
            >
              {isSpeakEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <div className={cn('h-2 w-2 rounded-full mx-1', isListening ? 'bg-destructive animate-pulse' : 'bg-muted-foreground')} />
            <button onClick={toggleVoiceWidget} className="text-muted-foreground hover:text-foreground transition-colors ml-1">
              <span className="sr-only">Close</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
          {/* Welcome Message */}
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground italic">ClinicOS Medical Assistant</p>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-none bg-primary text-primary-foreground px-3 py-2 text-sm shadow-sm">
                {transcript}
              </div>
            </div>
          )}

          {/* AI Response */}
          {processing && (
            <div className="flex items-start gap-2">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-accent p-3 text-sm shadow-sm flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
              </div>
            </div>
          )}

          {aiResponse && (
            <div className="flex items-start gap-2">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="max-w-[80%] rounded-2xl rounded-tl-none bg-accent p-3 text-sm shadow-sm">
                {aiResponse}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Input */}
        <div className="p-4 border-t bg-background">
          <div className="flex items-center gap-2 mb-3">
             <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="h-7 text-[10px] w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="marathi">Marathi</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {isListening ? "Listening..." : "Voice or Text"}
            </span>
          </div>

          <form onSubmit={handleSendText} className="flex items-center gap-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              className="h-10 text-sm"
              disabled={isListening || processing}
            />
            
            {userInput ? (
              <Button type="submit" size="sm" className="h-10 w-10 shrink-0" disabled={processing}>
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleMicToggle}
                size="sm"
                variant={isListening ? "destructive" : "default"}
                className={cn('h-10 w-10 shrink-0 transition-all', isListening && 'animate-pulse')}
                disabled={processing}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

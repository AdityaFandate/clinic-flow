import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Bot, Loader2 } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

export function VoiceAssistantWidget() {
  const { voiceWidgetOpen, toggleVoiceWidget } = useUIStore();
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<Language>('english');
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleMicToggle = () => {
    if (isListening) {
      setIsListening(false);
      setProcessing(true);
      // Mock AI response
      setTimeout(() => {
        setAiResponse('I found an available slot with Dr. Anika Sharma tomorrow at 10:15 AM. Would you like me to book it?');
        setProcessing(false);
      }, 1500);
    } else {
      setIsListening(true);
      setAiResponse('');
      // Mock transcript
      setTimeout(() => {
        setTranscript('I need to book an appointment with a general physician for tomorrow morning.');
      }, 1000);
    }
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
    <Card className="fixed bottom-6 right-6 z-50 w-80 border-border shadow-xl">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">Voice Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn('h-2 w-2 rounded-full', isListening ? 'bg-success animate-pulse-soft' : 'bg-muted-foreground')} />
            <button onClick={toggleVoiceWidget} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
          </div>
        </div>

        {/* Language */}
        <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="hindi">Hindi</SelectItem>
            <SelectItem value="marathi">Marathi</SelectItem>
          </SelectContent>
        </Select>

        {/* Transcript */}
        {transcript && (
          <div className="rounded-lg bg-accent p-3">
            <p className="text-xs text-muted-foreground mb-1">You said:</p>
            <p className="text-sm text-foreground">{transcript}</p>
          </div>
        )}

        {/* AI Response */}
        {processing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Processing...
          </div>
        )}
        {aiResponse && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
            <p className="text-xs text-primary mb-1">Assistant:</p>
            <p className="text-sm text-foreground">{aiResponse}</p>
          </div>
        )}

        {/* Mic Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleMicToggle}
            size="icon"
            className={cn(
              'h-14 w-14 rounded-full transition-all',
              isListening && 'bg-destructive hover:bg-destructive/90 ring-4 ring-destructive/20'
            )}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

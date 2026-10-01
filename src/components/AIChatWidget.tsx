import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Minimize2, Bot, ChevronUp, MessageCircle } from 'lucide-react';
import profileLogo from '../assets/images/ag_kodlama_logo_1790860803823.jpg';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      role: 'model',
      text: 'Merhaba! Ben AG Yapay Zekası. Alperen Genç\'in 38 haftalık gelişim süreci, projeleri ve Google Drive linkleri hakkında sorularınızı yanıtlamaya hazırım. Ne öğrenmek istersiniz?',
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Yapay zeka yanıt veremedi.');
      }

      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'model',
        text: data.reply || 'Cevap alınamadı.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: unknown) {
      const errMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'model',
        text: err instanceof Error ? `Hata: ${err.message}` : 'Bağlantı sırasında bir hata oluştu.',
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <aside aria-label="AG Yapay Zekası Sohbet Asistanı" className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="mb-3.5 w-[94vw] sm:w-[420px] max-h-[620px] h-[540px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 transition-colors ring-1 ring-slate-950/5">
          {/* Chat Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <img
                  src={profileLogo}
                  alt="AG Yapay Zekası"
                  className="w-10 h-10 rounded-2xl object-cover border-2 border-white/40 bg-white shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-700" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm tracking-tight">AG Yapay Zekası</span>
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-xs">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[11px] text-blue-100/90 flex items-center gap-1 mt-0.5 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>38 Hafta Gelişim &amp; Proje Rehberi</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                title="Küçült / Kapat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3.5 py-2.5 bg-slate-50/90 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => {
                setInput('Alperen Genç bu sitede neler yaptı, genel özet verir misin?');
              }}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer font-medium shadow-2xs"
            >
              💡 Genel Özet
            </button>
            <button
              onClick={() => {
                setInput('Google Drive linki olan haftalar hangileri?');
              }}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer font-medium shadow-2xs"
            >
              📂 Drive Dosyaları
            </button>
            <button
              onClick={() => {
                setInput('Kaçıncı hafta tamamlandı ve yapıldı olarak işaretli?');
              }}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer font-medium shadow-2xs"
            >
              ✅ Tamamlanan Haftalar
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-white dark:bg-slate-900 transition-colors">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <img
                      src={profileLogo}
                      alt="AG Bot"
                      className="w-7 h-7 rounded-xl object-cover border border-slate-200 dark:border-slate-700 mt-0.5 shrink-0 shadow-2xs"
                    />
                  )}
                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-xs font-medium'
                        : 'bg-slate-100/90 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/80 dark:border-slate-700'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right font-mono ${
                        isUser ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs py-1">
                <img
                  src={profileLogo}
                  alt="AG Bot"
                  className="w-7 h-7 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-slate-600 dark:text-slate-300 shadow-2xs">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-xs">AG Yapay Zekası düşünüyor...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Site veya haftalarla ilgili bir soru sorun..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
              title="Gönder"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bottom-Right Badge Button - Ultra Refined & Eye-Catching */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        type="button"
        title={isOpen ? 'Sohbeti Kapat' : 'AG Yapay Zekası ile Konuş'}
        aria-label="AG Yapay Zekası"
        className="group relative flex items-center gap-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 p-2 sm:pl-2.5 sm:pr-4 rounded-2xl shadow-xl hover:shadow-2xl border-2 border-blue-500/60 dark:border-blue-500 transition-all duration-200 cursor-pointer active:scale-95 ring-4 ring-blue-500/10 hover:ring-blue-500/20"
      >
        <div className="relative">
          <img
            src={profileLogo}
            alt="AG Yapay Zekası"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform"
          />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border-2 border-white dark:border-slate-900" />
          </span>
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white leading-none">
              AG Yapay Zekası
            </span>
            <span className="text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-1 py-0.2 rounded">
              AI
            </span>
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{isOpen ? 'Pencereyi Küçült' : 'Siteye Soru Sor'}</span>
          </span>
        </div>

        <div className="p-1 rounded-lg bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 ml-0.5 group-hover:bg-blue-100 dark:group-hover:bg-slate-700 transition-colors">
          <ChevronUp className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
    </aside>
  );
}

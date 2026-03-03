import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MessageCircle, X, Send, SmilePlus } from 'lucide-react';
import { useTripChat, ChatMsg } from '../hooks/useTripChat';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Turn a name/email string into a consistent pastel color */
function avatarColor(str: string): string {
    const colors = [
        'bg-purple-500', 'bg-blue-500', 'bg-emerald-500',
        'bg-rose-500', 'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500',
    ];
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
}

/** Format ISO timestamp → "12:34 PM" */
function fmtTime(ts: string): string {
    try {
        return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
    } catch { return ''; }
}

// Quick emoji panel — no library needed
const EMOJIS = ['😄', '😂', '🥰', '😎', '😮', '😢', '🔥', '👍', '❤️', '🎉', '✈️', '🗺️', '🏖️', '🍽️', '💬'];

// ── component ─────────────────────────────────────────────────────────────────

interface TripChatProps {
    tripId: string;
    userEmail: string;
    userName: string;
}

export const TripChat: React.FC<TripChatProps> = ({ tripId, userEmail, userName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [unread, setUnread] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const prevCountRef = useRef(0);

    const { messages, sendMessage, connected } = useTripChat({
        tripId,
        senderEmail: userEmail,
        senderName: userName,
        enabled: !!tripId && !!userEmail,
    });

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        // Count unread when panel is closed
        if (!isOpen && messages.length > prevCountRef.current) {
            setUnread(u => u + (messages.length - prevCountRef.current));
        }
        prevCountRef.current = messages.length;
    }, [messages, isOpen]);

    // Clear unread when opened
    useEffect(() => {
        if (isOpen) {
            setUnread(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput('');
        setShowEmoji(false);
    };

    const panel = (
        <div
            className="fixed bottom-6 z-[60] flex flex-col bg-white dark:bg-surface-a0 w-[340px] md:w-[380px] h-[520px] rounded-2xl shadow-2xl border border-slate-100 dark:border-surface-a10 overflow-hidden"
            style={{ right: '1.5rem' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600">
                <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-white/80" />
                    <span className="text-white font-semibold text-sm">Trip Chat</span>
                    {connected
                        ? <span className="w-2 h-2 rounded-full bg-emerald-400 ml-1" title="Connected" />
                        : <span className="w-2 h-2 rounded-full bg-slate-400 ml-1 animate-pulse" title="Connecting…" />
                    }
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-slate-50 dark:bg-surface-a0">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-400 text-sm text-center">Be the first to say hello 👋<br /><span className="text-xs opacity-60">Only trip collaborators can see this chat</span></p>
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isOwn = msg.senderEmail === userEmail;
                    const showName = !isOwn && (i === 0 || messages[i - 1].senderEmail !== msg.senderEmail);
                    return (
                        <div key={i} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar — only for others, only on last message in a streak */}
                            {!isOwn && (i === messages.length - 1 || messages[i + 1]?.senderEmail !== msg.senderEmail) ? (
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(msg.senderEmail)}`}>
                                    {(msg.senderName || msg.senderEmail)[0].toUpperCase()}
                                </div>
                            ) : !isOwn ? (
                                <div className="w-7 shrink-0" /> // spacer
                            ) : null}

                            <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[72%]`}>
                                {showName && (
                                    <span className="text-[10px] text-slate-400 mb-0.5 ml-1">{msg.senderName || msg.senderEmail.split('@')[0]}</span>
                                )}
                                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${isOwn
                                    ? 'bg-purple-600 text-white rounded-br-sm'
                                    : 'bg-white dark:bg-surface-a10 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-surface-a10 rounded-bl-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                                <span className="text-[9px] text-slate-400 mt-0.5 px-1">{fmtTime(msg.timestamp)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Emoji picker */}
            {showEmoji && (
                <div className="px-3 py-2 bg-white dark:bg-surface-a0 border-t border-slate-100 dark:border-surface-a10 flex flex-wrap gap-1">
                    {EMOJIS.map(e => (
                        <button key={e} onClick={() => setInput(i => i + e)} className="text-lg hover:scale-125 transition-transform">
                            {e}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 bg-white dark:bg-surface-a0 border-t border-slate-100 dark:border-surface-a10 flex gap-2 items-center">
                <button
                    onClick={() => setShowEmoji(s => !s)}
                    className={`text-slate-400 hover:text-purple-500 transition-colors ${showEmoji ? 'text-purple-500' : ''}`}
                    title="Emoji"
                >
                    <SmilePlus className="w-5 h-5" />
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message…"
                    className="flex-1 bg-slate-100 dark:bg-surface-a10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:text-slate-100 placeholder-slate-400"
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white p-2 rounded-xl transition-colors"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* FAB toggle button — rendered in normal flow */}
            <div className="fixed bottom-6 right-6 z-50">
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 relative"
                        title="Trip Chat"
                    >
                        <MessageCircle className="w-6 h-6" />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </button>
                )}
            </div>

            {/* Chat panel in portal so it sits above everything */}
            {isOpen && ReactDOM.createPortal(panel, document.body)}
        </>
    );
};

export default TripChat;

import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';

export interface ChatMsg {
    tripId: string;
    senderEmail: string;
    senderName: string;
    content: string;
    timestamp: string; // ISO-8601 from server
}

interface UseTripChatProps {
    tripId: string;
    senderEmail: string;
    senderName: string;
    enabled: boolean;
}

export const useTripChat = ({ tripId, senderEmail, senderName, enabled }: UseTripChatProps) => {
    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [connected, setConnected] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const clientRef = useRef<Client | null>(null);

    // ── Fetch persisted history on mount ────────────────────────────────────
    useEffect(() => {
        if (!enabled || !tripId) return;

        const token = localStorage.getItem('northern_auth_token');
        fetch(`http://localhost:8090/collab/trips/${tripId}/messages`, {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        })
            .then(r => r.ok ? r.json() : [])
            .then((history: ChatMsg[]) => {
                setMessages(history);
                setHistoryLoaded(true);
            })
            .catch(() => setHistoryLoaded(true)); // fail silently — real-time still works
    }, [tripId, enabled]);

    // ── Send via STOMP ───────────────────────────────────────────────────────
    const sendMessage = useCallback((content: string) => {
        if (!clientRef.current || !content.trim()) return;

        const msg: Omit<ChatMsg, 'timestamp'> = {
            tripId,
            senderEmail,
            senderName,
            content: content.trim(),
        };

        clientRef.current.publish({
            destination: `/app/trip/${tripId}/chat`,
            body: JSON.stringify(msg),
            headers: { 'content-type': 'application/json' },
        });
    }, [tripId, senderEmail, senderName]);

    // ── STOMP real-time subscription ─────────────────────────────────────────
    useEffect(() => {
        if (!enabled || !tripId) return;

        const client = new Client({
            brokerURL: 'ws://localhost:8082/ws-collab',
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/chat/${tripId}`, (frame) => {
                    const msg: ChatMsg = JSON.parse(frame.body);
                    // Avoid duplicate if server echoes back a message we already have in history
                    setMessages(prev => {
                        const alreadyExists = prev.some(
                            m => m.timestamp === msg.timestamp && m.senderEmail === msg.senderEmail && m.content === msg.content
                        );
                        return alreadyExists ? prev : [...prev, msg];
                    });
                });
            },
            onDisconnect: () => setConnected(false),
            onStompError: (frame) => {
                console.error('[Chat] STOMP error:', frame.headers['message']);
            },
        });

        client.activate();
        clientRef.current = client;

        return () => {
            client.deactivate();
            clientRef.current = null;
        };
    }, [tripId, enabled]);

    return { messages, sendMessage, connected, historyLoaded };
};

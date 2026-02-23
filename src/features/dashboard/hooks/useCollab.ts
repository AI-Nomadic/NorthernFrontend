import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useAppDispatch } from '../../../state/hooks';
import {
    addActivity,
    removeActivity,
    reorderActivitiesWithinDay,
    moveActivityBetweenDays,
    updateActivity,
    swapDays,
    setAccommodation,
    addDay,
    deleteDay,
    updateDay
} from '../../../state/slices/dashboardSlice';

export type CollabEventType =
    | 'ACTIVITY_ADDED'
    | 'ACTIVITY_REMOVED'
    | 'ACTIVITY_UPDATED'
    | 'ACTIVITY_REORDERED'
    | 'ACTIVITY_MOVED'
    | 'HOTEL_UPDATED'
    | 'HOTEL_REMOVED'
    | 'DAY_ADDED'
    | 'DAY_REMOVED'
    | 'DAY_UPDATED'
    | 'DAYS_REORDERED'
    | 'TRIP_RENAMED';

export interface CollabMessage {
    senderEmail: string;
    tripId: string;
    type: CollabEventType;
    payload: any;
}

export interface CollabPayloads {
    ACTIVITY_ADDED: { dayId: string; activity: any; insertionIndex?: number };
    ACTIVITY_REMOVED: { dayId: string; activityId: string };
    ACTIVITY_UPDATED: { dayId: string; activityId: string; updates: any };
    ACTIVITY_REORDERED: { dayId: string; oldIndex: number; newIndex: number };
    ACTIVITY_MOVED: { sourceDayId: string; targetDayId: string; activityId: string; targetIndex?: number };
    HOTEL_UPDATED: { dayId: string; newHotel: any };
    HOTEL_REMOVED: { dayId: string };
    DAY_ADDED: { day: any };
    DAY_REMOVED: { dayId: string };
    DAY_UPDATED: { dayId: string; updates: any };
    DAYS_REORDERED: { oldIndex: number; newIndex: number };
    TRIP_RENAMED: { newTitle: string };
}

interface UseCollabProps {
    tripId: string;
    userEmail: string;
    enabled: boolean;
}

export const useCollab = ({ tripId, userEmail, enabled }: UseCollabProps) => {
    const dispatch = useAppDispatch();
    const clientRef = useRef<Client | null>(null);
    const isConnected = useRef(false);

    const broadcast = useCallback(<T extends CollabEventType>(type: T, payload: CollabPayloads[T]) => {
        if (!clientRef.current || !isConnected.current) {
            console.warn('[Collab] Cannot broadcast: Not connected');
            return;
        }

        const message: CollabMessage = {
            senderEmail: userEmail,
            tripId,
            type,
            payload
        };

        console.log(`[Collab] Broadcasting: ${type}`, payload);
        clientRef.current.publish({
            destination: `/app/trip/${tripId}/update`,
            body: JSON.stringify(message),
            headers: { 'content-type': 'application/json' }
        });
    }, [tripId, userEmail]);

    useEffect(() => {
        if (!enabled || !tripId) return;

        console.log(`[Collab] Connecting to trip: ${tripId}`);

        const client = new Client({
            brokerURL: 'ws://localhost:8082/ws-collab',
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                isConnected.current = true;
                console.log('[Collab] Connected');

                client.subscribe(`/topic/trip/${tripId}`, (message) => {
                    const data: CollabMessage = JSON.parse(message.body);

                    // Ignore messages from self
                    if (data.senderEmail === userEmail) return;

                    console.log(`[Collab] Received: ${data.type}`, data.payload);

                    // Sync state based on event type
                    switch (data.type) {
                        case 'ACTIVITY_ADDED':
                            dispatch(addActivity({
                                dayId: data.payload.dayId,
                                activity: data.payload.activity,
                                insertionIndex: data.payload.insertionIndex
                            }));
                            break;
                        case 'ACTIVITY_REMOVED':
                            dispatch(removeActivity({
                                dayId: data.payload.dayId,
                                activityId: data.payload.activityId
                            }));
                            break;
                        case 'ACTIVITY_UPDATED':
                            dispatch(updateActivity({
                                dayId: data.payload.dayId,
                                activityId: data.payload.activityId,
                                updates: data.payload.updates
                            }));
                            break;
                        case 'ACTIVITY_REORDERED':
                            dispatch(reorderActivitiesWithinDay({
                                dayId: data.payload.dayId,
                                oldIndex: data.payload.oldIndex,
                                newIndex: data.payload.newIndex
                            }));
                            break;
                        case 'ACTIVITY_MOVED':
                            dispatch(moveActivityBetweenDays({
                                sourceDayId: data.payload.sourceDayId,
                                targetDayId: data.payload.targetDayId,
                                activityId: data.payload.activityId,
                                targetIndex: data.payload.targetIndex
                            }));
                            break;
                        case 'HOTEL_UPDATED':
                            dispatch(setAccommodation({
                                dayId: data.payload.dayId,
                                accommodation: data.payload.newHotel
                            }));
                            break;
                        case 'HOTEL_REMOVED':
                            dispatch(setAccommodation({
                                dayId: data.payload.dayId,
                                accommodation: null
                            }));
                            break;
                        case 'DAY_ADDED':
                            dispatch(addDay(data.payload.day));
                            break;
                        case 'DAY_REMOVED':
                            dispatch(deleteDay({ dayId: data.payload.dayId }));
                            break;
                        case 'DAY_UPDATED':
                            dispatch(updateDay({ dayId: data.payload.dayId, updates: data.payload.updates }));
                            break;
                        case 'DAYS_REORDERED':
                            dispatch(swapDays({
                                index1: data.payload.oldIndex,
                                index2: data.payload.newIndex
                            }));
                            break;
                        case 'TRIP_RENAMED':
                            // We should have a renameTrip action in slice
                            // I'll call it renameTrip
                            dispatch({ type: 'dashboard/renameTrip', payload: data.payload.newTitle });
                            break;
                    }
                });
            },
            onStompError: (frame) => {
                console.error('[Collab] Broker reported error: ' + frame.headers['message']);
                console.error('[Collab] Additional details: ' + frame.body);
            },
            onDisconnect: () => {
                isConnected.current = false;
                console.log('[Collab] Disconnected');
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            console.log('[Collab] Deactivating client');
            client.deactivate();
        };
    }, [tripId, userEmail, enabled, dispatch]);

    return { broadcast };
};

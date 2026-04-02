import React from 'react';
import {
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    UniqueIdentifier,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Activity } from '@types';
import { useAppDispatch, useAppSelector, selectItinerary, selectDragState, selectDiscoveryTab } from '@state';
import {
    dragStart,
    dragCancel,
    addActivity,
    reorderActivitiesWithinDay,
    moveActivityBetweenDays,
    reorderDays,
    swapDays,
    setAccommodation,
    autosaveItinerary,
    performHydration,
    performAccommodationHydration,
} from '@state/slices/dashboardSlice';
import { removeSuggestion, fetchReplacementSuggestion } from '@state/slices/discoverySlice';
import { DRAG_TYPES } from '../utils';
import { CollabEventType, CollabPayloads } from './useCollab';

export const useDragAndDrop = (broadcast?: <T extends CollabEventType>(type: T, payload: CollabPayloads[T]) => void) => {
    const dispatch = useAppDispatch();
    const itinerary = useAppSelector(selectItinerary);
    const activitySkeletons = useAppSelector(state => state.discovery.activitySkeletons);
    const culinarySkeletons = useAppSelector(state => state.discovery.culinarySkeletons);
    const lodgingSkeletons = useAppSelector(state => state.discovery.lodgingSkeletons);
    const activeTab = useAppSelector(selectDiscoveryTab);
    const { activeId, activeDragType, activeDragItem } = useAppSelector(selectDragState);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const findDayId = (id: UniqueIdentifier): UniqueIdentifier | null => {
        if (!itinerary) return null;
        if (itinerary.itinerary.find(d => d.id === id)) return id;
        const dayWithActivity = itinerary.itinerary.find(d => d.activities.some(a => a.id === id));
        if (dayWithActivity) return dayWithActivity.id;
        return null;
    };

    // -- Drag Context Handlers --

    // Called when a drag operation starts
    // Captures the item being dragged and stores it in Redux state
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const type = active.data.current?.type;
        const item = active.data.current?.item || active.data.current?.activity || active.data.current?.dayPlan;

        dispatch(dragStart({
            id: active.id as string,
            type: type || '',
            item,
        }));
    };

    // Called continuously while dragging over other items
    // Only used for visual updates by DndKit, no state changes here
    const handleDragOver = (event: DragOverEvent) => {
        // handleDragOver is for visual feedback only
        // Actual moves happen in handleDragEnd for smooth experience
    };

    // Called when the user drops the item
    // Calculates the new position and dispatches the appropriate Redux action
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        // If not dropped on a valid target, cancel the operation
        if (!over || !activeDragType || !itinerary) {
            dispatch(dragCancel());
            return;
        }

        // -- Activity Reordering Logic --
        if (activeDragType === DRAG_TYPES.ACTIVITY) {
            const sourceDayId = findDayId(active.id);
            if (!sourceDayId) {
                dispatch(dragCancel());
                return;
            }

            // Determine target day and insertion index
            let targetDayId: UniqueIdentifier | null = null;
            let insertionIndex: number | undefined = undefined;

            // Check if dropped on another activity
            const droppedOnActivity = itinerary.itinerary.find(d =>
                d.activities.some(a => a.id === over.id)
            );

            if (droppedOnActivity) {
                targetDayId = droppedOnActivity.id;
                insertionIndex = droppedOnActivity.activities.findIndex(a => a.id === over.id);
            }
            // Check if dropped on activity list zone
            else if (over.data.current?.type === 'ACTIVITY_LIST') {
                targetDayId = over.data.current.dayId;
                insertionIndex = undefined; // Add to end
            }
            // Check if dropped on a day card itself
            else if (itinerary.itinerary.find(d => d.id === over.id)) {
                targetDayId = over.id;
                insertionIndex = undefined; // Add to end
            }

            if (!targetDayId) {
                dispatch(dragCancel());
                return;
            }

            // Same day reordering
            if (sourceDayId === targetDayId) {
                const day = itinerary.itinerary.find(d => d.id === sourceDayId);
                if (!day) {
                    dispatch(dragCancel());
                    return;
                }

                const oldIndex = day.activities.findIndex(a => a.id === active.id);

                // If dropped on another activity in same day
                if (insertionIndex !== undefined && oldIndex !== insertionIndex) {
                    dispatch(reorderActivitiesWithinDay({
                        dayId: sourceDayId as string,
                        oldIndex,
                        newIndex: insertionIndex,
                    }));

                    if (broadcast) {
                        broadcast('ACTIVITY_REORDERED', {
                            dayId: sourceDayId as string,
                            oldIndex,
                            newIndex: insertionIndex as number
                        });
                    }
                    dispatch(autosaveItinerary());
                } else {
                    dispatch(dragCancel());
                }
            }
            // Cross-day move
            else {
                dispatch(moveActivityBetweenDays({
                    sourceDayId: sourceDayId as string,
                    targetDayId: targetDayId as string,
                    activityId: active.id as string,
                    targetIndex: insertionIndex,
                }));

                if (broadcast) {
                    broadcast('ACTIVITY_MOVED', {
                        sourceDayId: sourceDayId as string,
                        targetDayId: targetDayId as string,
                        activityId: active.id as string,
                        targetIndex: insertionIndex
                    });
                }
                dispatch(autosaveItinerary());
            }
        }

        // Handle day reordering - using SWAP logic instead of shift
        else if (activeDragType === DRAG_TYPES.DAY) {
            const oldIdx = itinerary.itinerary.findIndex(d => d.id === active.id);
            const newIdx = itinerary.itinerary.findIndex(d => d.id === over.id);

            if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                // Use swap instead of reorder to directly exchange positions
                dispatch(swapDays({ index1: oldIdx, index2: newIdx }));

                if (broadcast) {
                    broadcast('DAYS_REORDERED', {
                        oldIndex: oldIdx,
                        newIndex: newIdx
                    });
                }
                dispatch(autosaveItinerary());
            } else {
                dispatch(dragCancel());
            }
        }

        // Handle sidebar activity drop
        else if (activeDragType === DRAG_TYPES.SIDEBAR_ACTIVITY) {
            let targetDayId: string | null = null;
            let insertionIndex: number | undefined = undefined;

            // Check if dropped on a specific activity - insert before it
            const droppedOnActivity = itinerary.itinerary.find(d =>
                d.activities.some(a => a.id === over.id)
            );

            if (droppedOnActivity) {
                targetDayId = droppedOnActivity.id;
                insertionIndex = droppedOnActivity.activities.findIndex(a => a.id === over.id);
            }
            // Check if dropped on activity list zone - insert at end
            else if (over.data.current?.type === 'ACTIVITY_LIST') {
                targetDayId = over.data.current.dayId;
                insertionIndex = undefined; // Will add to end
            }
            // Check if dropped on a day card itself - append to end
            else if (itinerary.itinerary.find(d => d.id === over.id)) {
                targetDayId = over.id as string;
                insertionIndex = undefined;
            }

            if (targetDayId && activeDragItem) {
                const day = itinerary.itinerary.find(d => d.id === targetDayId);
                const isSkeleton = active.data.current?.isSkeleton;

                if (day) {
                    const activityId = isSkeleton 
                        ? (activeDragItem.id || `act-${Date.now()}`)
                        : `${activeDragItem.id || activeDragItem.title}-${Date.now()}`;

                    const newActivity: Activity = {
                        id: activityId,
                        title: activeDragItem.title,
                        description: isSkeleton ? 'Hydrating details...' : (activeDragItem.description || ''),
                        location: activeDragItem.location || '',
                        time: day.activities.length > 0
                            ? day.activities[day.activities.length - 1].time
                            : '09:00',
                        cost_estimate: activeDragItem.cost_estimate || 0,
                        category: activeDragItem.category || 'Sightseeing',
                        durationMinutes: activeDragItem.durationMinutes || 120,
                        type: 'activity',
                        status: 'planned',
                        isDraft: false, // Don't show input field
                        isHydrating: isSkeleton, // Show loading state instead
                        imageGallery: []
                    };

                    dispatch(addActivity({
                        dayId: targetDayId,
                        activity: newActivity,
                        insertionIndex,
                    }));

                    if (isSkeleton) {
                        // Corrected: Use location data if available, fallback to title
                        const cleanDestination = itinerary.location?.region || itinerary.location?.province || itinerary.trip_title;

                        // Logistics Extraction: Find the "Previous Stop" for real-world travel calculation
                        // Guard: accommodation may not exist on empty/new days
                        let prevCoords = day.accommodation?.coordinates;
                        let startTime = "9:00 AM";

                        if (insertionIndex !== undefined && insertionIndex > 0) {
                            const prevAct = day.activities[insertionIndex - 1];
                            prevCoords = prevAct?.coordinates ?? prevCoords;
                            startTime = prevAct?.timeSlot?.end || prevAct?.time || "9:00 AM";
                        } else if (day.activities.length > 0 && insertionIndex === undefined) {
                            // Being appended to the end
                            const lastAct = day.activities[day.activities.length - 1];
                            prevCoords = lastAct?.coordinates ?? prevCoords;
                            startTime = lastAct?.timeSlot?.end || lastAct?.time || "9:00 AM";
                        }

                        console.log(`💧 [DnD] Dispatching Rich Hydration for ${activeDragItem.title} in ${cleanDestination}`);
                        console.log(`📍 [DnD] Context: PrevCoords: ${JSON.stringify(prevCoords)}, StartTime: ${startTime}`);
                        
                        dispatch(performHydration({
                            dayId: targetDayId,
                            activity: activeDragItem,
                            destination: cleanDestination,
                            prevCoords,
                            startTime
                        }));

                        // Compute excludeNames filtering out the one we are actively dropping
                        const currentTabSkeletons = activeTab === 'culinary' ? culinarySkeletons : activitySkeletons;
                        const excludeNames = [
                            ...currentTabSkeletons.filter(s => s.id !== activeDragItem.id).map(s => s.title),
                            ...(itinerary.itinerary.flatMap(day => day.activities.map(a => a.title))),
                            activeDragItem.title // explicitly add this, since state hasn't updated in closure
                        ];

                        // Remove from sidebar and fetch replacement
                        // Only applies to AI tabs
                        if (activeTab === 'exploration' || activeTab === 'culinary') {
                            dispatch(removeSuggestion({ id: activeDragItem.id, type: activeTab }));
                            dispatch(fetchReplacementSuggestion({
                                destination: cleanDestination,
                                tags: [activeDragItem.category],
                                type: activeTab,
                                excludeNames
                            }));
                        }
                    }

                    if (broadcast) {
                        broadcast('ACTIVITY_ADDED', {
                            dayId: targetDayId,
                            activity: newActivity,
                            insertionIndex,
                        });
                    }
                    // Only autosave immediately if it's NOT a skeleton.
                    // If it IS a skeleton, performHydration is running and will autosave upon completion.
                    // This prevents Java backend from stripping the UUID before hydration finds it.
                    if (!isSkeleton) {
                        dispatch(autosaveItinerary());
                    }
                }
            } else {
                dispatch(dragCancel());
            }
        }

        // Handle sidebar accommodation drop
        else if (activeDragType === DRAG_TYPES.SIDEBAR_ACCOMMODATION) {
            let targetDayId: string | null = null;

            // Check if dropped on hotel zone
            if (over.data.current?.type === 'HOTEL_ZONE') {
                targetDayId = over.data.current.dayId;
            }

            if (targetDayId && activeDragItem) {
                const isSkeleton = active.data.current?.isSkeleton;
                
                const cleanDestination = itinerary.location?.region || itinerary.location?.province || itinerary.trip_title;
                const accommodationId = isSkeleton 
                    ? (activeDragItem.id || `act-${Date.now()}`)
                    : `${activeDragItem.id || activeDragItem.title}-${Date.now()}`;

                const newAccommodation = {
                    ...activeDragItem,
                    id: accommodationId,
                    hotelName: activeDragItem.title || activeDragItem.hotelName, // Mapping title to hotelName for skeletons
                    isHydrating: isSkeleton
                };

                dispatch(setAccommodation({
                    dayId: targetDayId,
                    accommodation: newAccommodation,
                }));

                if (isSkeleton) {
                    console.log(`💧 [DnD] Dispatching Rich Hydration for Hotel ${activeDragItem.title}`);
                    dispatch(performAccommodationHydration({
                        dayId: targetDayId,
                        accommodation: activeDragItem,
                        destination: cleanDestination
                    }));

                    const excludeNames = [
                        ...lodgingSkeletons.filter(s => s.id !== activeDragItem.id).map(s => s.title),
                        ...(itinerary.itinerary.flatMap(day => day.activities.map(a => a.title))),
                        ...(itinerary.itinerary.map(day => day.accommodation?.hotelName).filter(Boolean) as string[]),
                        activeDragItem.title
                    ];

                    if (activeTab === 'stay') {
                        dispatch(removeSuggestion({ id: activeDragItem.id, type: 'stay' }));
                        dispatch(fetchReplacementSuggestion({
                            destination: cleanDestination,
                            tags: [activeDragItem.category || 'Hotel'],
                            type: 'stay',
                            excludeNames
                        }));
                    }
                }

                if (broadcast) {
                    broadcast('HOTEL_UPDATED', {
                        dayId: targetDayId,
                        newHotel: newAccommodation
                    });
                }
                
                // Only autosave immediately if it's NOT a skeleton
                if (!isSkeleton) {
                    dispatch(autosaveItinerary());
                }
            } else {
                dispatch(dragCancel());
            }
        } else {
            dispatch(dragCancel());
        }
    };

    const handleDragCancel = () => {
        dispatch(dragCancel());
    };

    return {
        sensors,
        activeId,
        activeDragType,
        activeDragItem,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDragCancel,
    };
};


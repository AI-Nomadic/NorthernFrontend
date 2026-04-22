import React from 'react';
// Forced reload for filter update
import { DndContext, rectIntersection, pointerWithin, MeasuringStrategy } from '@dnd-kit/core';
import { useNavigate, useBlocker, useBeforeUnload } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, PanelLeftOpen } from 'lucide-react';
import { Activity, Accommodation } from '@types';
import { getAccommodationSuggestion } from '@services';
import { useDragAndDrop, useZoomPan, useDiscovery } from './hooks';
import { useAppSelector, useAppDispatch, selectItinerary, selectTripState, selectSidebarOpen, selectSelectedActivity, selectSelectedAccommodation } from '@state';
import {
  setSidebarOpen,
  selectActivity,
  selectAccommodation,
  removeAccommodation,
  removeActivity,
  addActivity,
  updateActivity,
  setAccommodation as setAccommodationAction,
  deleteDay,
  selectDay,
  updateDay,
  fetchItinerary,
  addDay,
  toggleTripPublish,
  updateDayData,
  setHydrating,
  autosaveItinerary,
  architectAuditAndSave
} from '../../state/slices/dashboardSlice';
import { useCollab } from './hooks/useCollab';
import {
  DiscoverySidebar,
  DashboardCanvas,
  BudgetAuditor,
  ZoomControls,
  DetailModal,
  ActivityDetailContent,
  AccommodationDetailContent,
  DragOverlayContent,
  AccommodationFormModal,
  ActivityFormModal,
  DashboardHeader,
  DeleteConfirmationModal,
  TrashBin,
  TripChat
} from './components';
import { deleteTrip, updateTrip, inviteUserToTrip, removeCollaborator, revokeInvitation } from '@services/api';
import { selectUserEmail } from '@state/selectors';

interface DashboardProps {
  onReset: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onReset }) => {
  // -- Redux State Selectors --
  // Access global state for itinerary data and UI settings
  const dispatch = useAppDispatch();
  const itinerary = useAppSelector(selectItinerary);
  const tripState = useAppSelector(selectTripState);
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const selectedActivity = useAppSelector(selectSelectedActivity);

  const selectedAccommodation = useAppSelector(selectSelectedAccommodation);

  // Smart Restore State
  const selectedDayId = useAppSelector(state => state.dashboard.selectedDayId);
  const trashBinOpen = useAppSelector(state => state.dashboard.trashBinOpen);
  const email = useAppSelector(selectUserEmail);
  const userName = useAppSelector(state => state.user.name) || email?.split('@')[0] || 'User';
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const isDirty = useAppSelector(state => state.dashboard.isDirty);

  // -- Navigation Guard Logic --
  // Blocks navigation if the user has unsaved changes that haven't been audited
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Browser refresh/tab close protection
  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (isDirty) {
          event.preventDefault();
          return (event.returnValue = "Changes you made may not be saved. Do you really want to leave?");
        }
      },
      [isDirty]
    )
  );

  const handleSaveAndExit = async () => {
    if (itinerary) {
      setIsSaving(true);
      try {
        await dispatch(architectAuditAndSave());
        blocker.proceed?.();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancelExit = () => {
    blocker.reset?.();
  };

  // Early return — caller (DashboardRoute in App.tsx) guarantees itinerary is loaded
  if (!itinerary || !tripState) return null;

  // Collaboration Hook
  const { broadcast } = useCollab({
    tripId: itinerary?.id || '',
    userEmail: email || '',
    enabled: !!itinerary && !!email
  });

  // Custom Hooks
  const {
    sensors,
    activeId,
    activeDragType,
    activeDragItem,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop(broadcast);


  const {
    zoom,
    pan,
    isPanning,
    canvasRef,
    contentRef,
    setIsPanning,
    setPan,
    handleZoom,
    handlePan,
    resetView,
  } = useZoomPan();


  const {
    activeTab,
    discoveryItems,
    discoveryLoading,
    activeFilters,
    availableFilters,
    isSearchMode,
    handleTabChange,
    handleToggleFilter,
    handleRefresh,
  } = useDiscovery(tripState);

  const hydrating = useAppSelector(state => state.dashboard.hydrating);
  const [manualAccommodationDayId, setManualAccommodationDayId] = React.useState<string | null>(null);
  const [manualActivityDayId, setManualActivityDayId] = React.useState<string | null>(null);

  // --- HYDRATION STREAM ---
  React.useEffect(() => {
    if (!hydrating || !itinerary?.id) return;

    console.log(`📡 Starting Hydration Stream for Trip: ${itinerary.id}`);
    const PLANNER_BASE = import.meta.env.VITE_PLANNER_API_URL || 'http://localhost:8888/api/planner';
    const eventSource = new EventSource(`${PLANNER_BASE}/stream/${itinerary.id}`);

    eventSource.addEventListener('day_hydrated', (event) => {
        const data = JSON.parse(event.data);
        console.log(`✅ Day ${data.dayIndex + 1} Hydrated:`, data.dayData);
        dispatch(updateDayData({ dayIndex: data.dayIndex, dayData: data.dayData }));
    });

    eventSource.addEventListener('complete', () => {
        console.log('🏁 Hydration Stream Complete');
        dispatch(setHydrating(false));
        eventSource.close();

        // Immediately persist the fully-hydrated trip to the DB (first-ever POST)
        dispatch(autosaveItinerary());
    });

    eventSource.onerror = (err) => {
        console.error('❌ Hydration Stream Error:', err);
        dispatch(setHydrating(false));
        eventSource.close();
    };

    return () => {
        eventSource.close();
    };
  }, [hydrating, itinerary?.id, dispatch]);

  // Handlers
  const handleRemoveAccommodation = (dayId: string) => {
    dispatch(removeAccommodation({ dayId }));
    broadcast('HOTEL_REMOVED', { dayId });
    dispatch(selectAccommodation(null)); // Close modal if open
    dispatch(autosaveItinerary());
  };

  const handleRemoveActivity = (dayId: string, activityId: string) => {
    dispatch(removeActivity({ dayId, activityId }));
    broadcast('ACTIVITY_REMOVED', { dayId, activityId });
    dispatch(selectActivity(null));
    dispatch(autosaveItinerary());
  };

  const handleUpdateActivity = (dayId: string, activityId: string, updates: Partial<Activity>) => {
    dispatch(updateActivity({ dayId, activityId, updates }));
    broadcast('ACTIVITY_UPDATED', { dayId, activityId, updates });
    dispatch(autosaveItinerary());
  };

  const handleSaveManualAccommodation = (accommodation: Accommodation) => {
    if (manualAccommodationDayId) {
      dispatch(setAccommodationAction({ dayId: manualAccommodationDayId, accommodation }));
      broadcast('HOTEL_UPDATED', { dayId: manualAccommodationDayId, newHotel: accommodation });
      setManualAccommodationDayId(null);
      dispatch(autosaveItinerary());
    }
  };

  const handleSaveManualActivity = (activity: Activity) => {
    if (manualActivityDayId) {
      dispatch(addActivity({ dayId: manualActivityDayId, activity }));
      broadcast('ACTIVITY_ADDED', { dayId: manualActivityDayId, activity });
      setManualActivityDayId(null);
      dispatch(autosaveItinerary());
    }
  };

  const handleSave = () => {
    if (itinerary) {
      console.log('--- ARCHITECT AUDIT & SAVE ---');
      dispatch(architectAuditAndSave());
    }
  };

  const handleGetAccommodation = async (dayId: string) => {
    try {
      const day = itinerary.itinerary.find(d => d.id === dayId);
      if (!day) return;

      const location = day.activities[0]?.location || tripState.destination;
      const accom = await getAccommodationSuggestion(location, tripState.budget);
      dispatch(setAccommodationAction({ dayId, accommodation: accom }));
      broadcast('HOTEL_UPDATED', { dayId, newHotel: accom });
      dispatch(autosaveItinerary());
    } catch (err) {
      console.error('Failed to get accommodation', err);
    }
  };

  const handleDeleteTrip = async () => {
    if (!itinerary || !email) return;

    setIsDeleting(true);
    const success = await deleteTrip(itinerary.id);
    setIsDeleting(false);

    if (success) {
      setIsDeleteModalOpen(false);
      navigate('/gallery');
    } else {
    }
  };

  const handleInviteUser = async (invitedEmail: string) => {
    if (!itinerary) return false;
    const success = await inviteUserToTrip(itinerary.id, invitedEmail);
    if (success) {
      // Re-fetch trip data to show new pending invite
      dispatch(fetchItinerary(itinerary.id));
    }
    return success;
  };

  const handleRemoveCollaborator = async (collabEmail: string) => {
    if (!itinerary || !email) return false;
    const success = await removeCollaborator(itinerary.id, collabEmail);
    if (success) {
      // Re-fetch trip data to update the UI
      dispatch(fetchItinerary(itinerary.id));
    }
    return success;
  };

  const handleRevokeCollaborator = async (inviteeEmail: string) => {
    if (!itinerary || !email) return false;
    const success = await revokeInvitation(itinerary.id, inviteeEmail);
    if (success) {
      dispatch(fetchItinerary(itinerary.id));
    }
    return success;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      {/* -- Architectural Grid Layout -- */}
      {/* Uses CSS Grid to toggle sidebar visibility with smooth transition */}
      <div className="grid h-screen overflow-hidden" style={{ transition: 'grid-template-columns 0.5s ease-in-out', gridTemplateColumns: sidebarOpen ? '340px 1fr' : '0px 1fr' }}>

        {/* -- Discovery Sidebar (Left Column) -- */}
        <div className="relative z-20 overflow-hidden">
          <DiscoverySidebar
            isOpen={sidebarOpen}
            activeTab={activeTab}
            discoveryItems={discoveryItems}
            isLoading={discoveryLoading}
            // Smart Filter Props
            availableFilters={availableFilters}
            activeFilters={activeFilters}
            isSearchMode={isSearchMode}
            onToggleFilter={handleToggleFilter}
            onRefresh={handleRefresh}
            setActiveTab={handleTabChange}
            onClose={() => dispatch(setSidebarOpen(false))}
          />
        </div>

        {/* Main Content Area - Flexible Column */}
        <div className="flex flex-col bg-[#FCFCFC] dark:bg-surface-a0 relative z-10 min-w-0 overflow-hidden">

          {/* -- Live Mesh Background -- */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Pale Blue Blob - Top Left */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] bg-blue-600 rounded-full blur-[120px] mix-blend-multiply"
            />

            {/* Soft Purple Blob - Bottom Right */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                x: [0, -30, 0],
                y: [0, -50, 0],
                opacity: [0.1, 0.12, 0.1]
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-purple-600 rounded-full blur-[100px] mix-blend-multiply"
            />
          </div>
          {/* Top Bar */}
          {/* Top Bar - Refactored into DashboardHeader */}
          <DashboardHeader
            destination={tripState.destination}
            tripId={itinerary.id}
            onDelete={() => setIsDeleteModalOpen(true)}
            sidebarOpen={sidebarOpen}
            onSidebarToggle={() => dispatch(setSidebarOpen(!sidebarOpen))}
            onSave={handleSave}
            onInvite={handleInviteUser}
            onRemoveCollaborator={handleRemoveCollaborator}
            onRevokeCollaborator={handleRevokeCollaborator}
            collaborators={itinerary.collaborators}
            ownerEmail={itinerary.ownerEmail}
            isPublished={itinerary.visibility === 'PUBLIC'}
            onTogglePublish={() => {
              dispatch({ type: 'dashboard/togglePublish/pending' }); // Optional tracking
              dispatch(toggleTripPublish(itinerary.id));
            }}
            onRename={(newTitle) => {
              dispatch({ type: 'dashboard/renameTrip', payload: newTitle });
              broadcast('TRIP_RENAMED', { newTitle });
              dispatch(autosaveItinerary());
            }}
          />

          {/* Canvas Area - Flexible & Contained */}
          <div className="flex-1 relative overflow-hidden">
            <DashboardCanvas
              canvasRef={canvasRef}
              zoom={zoom}
              pan={pan}
              isPanning={isPanning}
              itinerary={itinerary.itinerary}
              activeId={activeId}
              startDate={tripState.startDate}
              onSelectActivity={(activity) => dispatch(selectActivity(activity))}
              onUpdateActivity={handleUpdateActivity}
              onRemoveActivity={handleRemoveActivity}
              onSelectAccommodation={(accommodation) => dispatch(selectAccommodation(accommodation))}
              onAutoSuggestAccommodation={handleGetAccommodation}
              onPanStart={() => setIsPanning(true)}
              onPan={handlePan}
              onPanEnd={() => setIsPanning(false)}
              onManualAccommodation={(dayId) => setManualAccommodationDayId(dayId)}
              onAddActivity={(dayId) => {
                const newActivity: Activity = {
                  id: self.crypto.randomUUID(),
                  title: '',
                  description: 'New Activity',
                  timeSlot: { start: 'TBD', end: 'TBD' },
                  durationMinutes: 60,
                  category: 'Sightseeing',
                  cost_estimate: 0,
                  location: 'TBD',
                  isDraft: true,
                  type: 'activity',
                  status: 'planned',
                  imageGallery: []
                };
                dispatch(addActivity({ dayId, activity: newActivity }));
                broadcast('ACTIVITY_ADDED', { dayId, activity: newActivity });
              }}
              onDeleteDay={(dayId) => {
                dispatch(deleteDay({ dayId }));
                broadcast('DAY_REMOVED', { dayId });
                dispatch(autosaveItinerary());
              }}
              // Smart Restore Props
              selectedDayId={selectedDayId}
              onSelectDay={(dayId) => dispatch(selectDay(dayId))}
              trashBinOpen={trashBinOpen}
              onAddDay={() => {
                const newDayNum = (itinerary.itinerary?.length || 0) + 1;
                const newDay = {
                  id: self.crypto.randomUUID(),
                  tripId: itinerary.id,
                  dayNumber: newDayNum,
                  theme: 'New Day',
                  activities: []
                };
                dispatch(addDay(newDay));
                broadcast('DAY_ADDED', { day: newDay });
                dispatch(autosaveItinerary());
              }}
              onUpdateDay={(dayId, updates) => {
                dispatch(updateDay({ dayId, updates }));
                broadcast('DAY_UPDATED', { dayId, updates });
                dispatch(autosaveItinerary());
                // If title changed, broadcast TRIP_RENAMED (if it was a trip-wide title change)
                if (updates.theme && itinerary.itinerary.find(d => d.id === dayId)?.dayNumber === 1) {
                  // Simplified: if Day 1 theme changes, maybe it's the title? 
                  // But the spec says TRIP_RENAMED is for "Naz's NYC Adventure".
                  // I'll skip broadcasting TRIP_RENAMED from here for now unless I find a better trigger.
                }
              }}
            />

            {/* Drag Overlay */}
            <DragOverlayContent
              activeId={activeId}
              activeDragType={activeDragType}
              activeDragItem={activeDragItem}
              zoom={zoom}
            />
          </div>

          {/* Zoom Controls - Overlay on Main Content */}
          <ZoomControls
            zoom={zoom}
            onZoomIn={() => handleZoom(0.1)}
            onZoomOut={() => handleZoom(-0.1)}
            onReset={resetView}
            className="fixed bottom-6 z-[100] flex flex-col gap-2 transition-[left] duration-500 ease-in-out"
            style={{ left: sidebarOpen ? '364px' : '24px' }}
          />

          {/* Budget Auditor - Overlay Top Right */}
          <BudgetAuditor totalCost={itinerary.itinerary.reduce((total, day) => { const activitiesCost = day.activities.reduce((sum, act) => sum + (act.cost_estimate || 0), 0); const hotelCost = day.accommodation?.pricePerNight || 0; return total + activitiesCost + hotelCost; }, 0)} budget={itinerary.metrics?.targetBudget || tripState?.budget || 1000} />
        </div>

        {/* Trip Group Chat - Fixed bottom-right */}
        <TripChat
          tripId={itinerary.id}
          userEmail={email || ''}
          userName={userName}
        />

        {/* Trash Bin - Fixed Position */}
        <TrashBin />

        {/* Activity Detail Modal */}
        <DetailModal
          isOpen={selectedActivity !== null}
          onClose={() => dispatch(selectActivity(null))}
          title="Activity Details"
        >
          {selectedActivity && (
            <ActivityDetailContent
              activity={selectedActivity}
              onRemove={() => {
                const day = itinerary.itinerary.find(d => d.activities.some(a => a.id === selectedActivity.id));
                if (day) handleRemoveActivity(day.id, selectedActivity.id);
              }}
            />
          )}
        </DetailModal>

        {/* Accommodation Detail Modal */}
        <DetailModal
          isOpen={selectedAccommodation !== null}
          onClose={() => dispatch(selectAccommodation(null))}
          title="Accommodation Details"
        >
          {selectedAccommodation && (
            <AccommodationDetailContent
              accommodation={selectedAccommodation}
              onRemove={() => {
                // Find the day ID for this accommodation? 
                // We need to pass the dayID specifically or find it in the state.
                // A simple lookup in itinerary works.
                const day = itinerary.itinerary.find(d => d.accommodation?.hotelName === selectedAccommodation.hotelName); // Simple match
                if (day) handleRemoveAccommodation(day.id);
              }}
            />
          )}
        </DetailModal>

        {/* Manual Accommodation Form Modal */}
        <AccommodationFormModal
          isOpen={manualAccommodationDayId !== null}
          onClose={() => setManualAccommodationDayId(null)}
          onSave={handleSaveManualAccommodation}
        />

        {/* Manual Activity Form Modal */}
        <ActivityFormModal
          isOpen={manualActivityDayId !== null}
          onClose={() => setManualActivityDayId(null)}
          onSave={handleSaveManualActivity}
        />
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTrip}
        isDeleting={isDeleting}
      />

      {/* -- Unsaved Changes (Navigation Guard) Modal -- */}
      {blocker.state === "blocked" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Glassmorphic Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelExit}
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-md bg-white dark:bg-surface-a0 rounded-3xl overflow-hidden shadow-2xl border border-white/20"
          >
            {/* Header with Background Gradient */}
            <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 flex items-center justify-center">
              <div className="p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30">
                <PanelLeftOpen className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="p-8 text-center">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Wait! You have unsaved changes
              </h3>
              <div className="flex flex-col gap-3 mt-4">
                <button
                  onClick={handleSaveAndExit}
                  disabled={isSaving}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-indigo-200"
                >
                  {isSaving ? "Saving..." : "Save Now"}
                </button>
                
                <button
                  onClick={handleCancelExit}
                  className="w-full py-4 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium transition-all"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </DndContext>
  );
};

export default Dashboard;

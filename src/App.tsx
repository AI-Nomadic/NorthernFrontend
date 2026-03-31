import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from '@features/landing';
import { Dashboard } from '@features/dashboard';
import LoginPage from './pages/LoginPage';
import GalleryPage from './pages/GalleryPage';
import ExplorePage from './pages/ExplorePage';
import TripDetailsPage from './pages/TripDetailsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { TravelFormData } from '@types';
import { fetchItinerary, resetDashboard, generateAITrip } from './state/slices/dashboardSlice';
import { logout } from './state/slices/userSlice';
import { useAppDispatch, useAppSelector } from './state';

/**
 * Wrapper that auto-restores the last open trip on page refresh.
 * Kept outside Dashboard so it NEVER violates React's Rules of Hooks —
 * Dashboard only mounts once data is ready, guaranteeing consistent hook order inside it.
 */
const DashboardRoute: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const dispatch = useAppDispatch();
  const itinerary = useAppSelector(state => state.dashboard.itinerary);
  const tripState = useAppSelector(state => state.dashboard.tripState);
  const loading = useAppSelector(state => state.dashboard.loading);

  useEffect(() => {
    // On mount: if no trip in Redux (e.g. page refresh), reload last-opened trip
    if (!itinerary && !loading) {
      const lastTripId = localStorage.getItem('northern_last_trip_id');
      if (lastTripId) {
        dispatch(fetchItinerary(lastTripId));
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!itinerary || !tripState) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FCFCFC] dark:bg-surface-a0">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading your trip...</p>
        </div>
      </div>
    );
  }

  return <Dashboard onReset={onReset} />;
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const theme = useAppSelector(state => state.user.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleGenerate = async (formData: TravelFormData) => {
    setLoading(true);
    try {
      const result = await dispatch(generateAITrip(formData)).unwrap() as any;
      console.log('--- TRIP SKELETON RECEIVED ---');
      console.log(result);
      navigate('/dashboard');
    } catch (err) {
      console.error('Itinerary generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    dispatch(resetDashboard());
    navigate('/');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage onGenerate={handleGenerate} loading={loading} />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRoute onReset={reset} /></ProtectedRoute>} />
      <Route path="/gallery" element={<ProtectedRoute><GalleryPage /></ProtectedRoute>} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/explore/trip/:tripId" element={<TripDetailsPage />} />
    </Routes>
  );
};

export default App;

import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LandingPage } from '@features/landing';
import { Dashboard } from '@features/dashboard';
import LoginPage from './pages/LoginPage';
import GalleryPage from './pages/GalleryPage';
import ProtectedRoute from './components/ProtectedRoute';
import { TripState } from '@types';
import { fetchItinerary, setTripState, resetDashboard } from './state/slices/dashboardSlice';
import { logout } from './state/slices/userSlice';
import { useAppDispatch } from './state';

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (trip: TripState) => {
    setLoading(true);
    dispatch(setTripState(trip));

    try {
      await dispatch(fetchItinerary('current')).unwrap();
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
      {/* Public routes */}
      <Route path="/" element={<LandingPage onGenerate={handleGenerate} loading={loading} />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes — redirect to /login if not authenticated */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard onReset={reset} />
        </ProtectedRoute>
      } />
      <Route path="/gallery" element={
        <ProtectedRoute>
          <GalleryPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default App;


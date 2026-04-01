import React, { useState, useEffect } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Outlet, 
  useNavigate 
} from 'react-router-dom';
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

const RootLayout: React.FC = () => {
  const theme = useAppSelector(state => state.user.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Use this to prevent router resets when state changes
  return <Outlet />;
};

const DashboardRouteWrapper: React.FC = () => {
  const dispatch = useAppDispatch();
  const itinerary = useAppSelector(state => state.dashboard.itinerary);
  const loading = useAppSelector(state => state.dashboard.loading);
  const tripState = useAppSelector(state => state.dashboard.tripState);
  const navigate = useNavigate();

  useEffect(() => {
    if (!itinerary && !loading) {
      const lastTripId = localStorage.getItem('northern_last_trip_id');
      if (lastTripId) {
        dispatch(fetchItinerary(lastTripId));
      }
    }
  }, [dispatch, itinerary, loading]);

  const reset = () => {
    dispatch(resetDashboard());
    navigate('/');
  };

  if (loading || !itinerary || !tripState) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#FCFCFC] dark:bg-surface-a0">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading your trip...</p>
        </div>
      </div>
    );
  }

  return <Dashboard onReset={reset} />;
};

// Helper component to handle generation + navigation
const LandingPageWithNavigate: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isGenerating = useAppSelector(state => state.dashboard.loading);

  const handleGenerate = async (formData: TravelFormData) => {
    try {
      await dispatch(generateAITrip(formData)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Itinerary generation failed', err);
    }
  };

  return <LandingPage onGenerate={handleGenerate} loading={isGenerating} />;
};

// --- ROUTER DEFINITION (OUTSIDE COMPONENT) ---
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <LandingPageWithNavigate />
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardRouteWrapper />
          </ProtectedRoute>
        )
      },
      {
        path: "/gallery",
        element: (
          <ProtectedRoute>
            <GalleryPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/explore",
        element: <ExplorePage />
      },
      {
        path: "/explore/trip/:tripId",
        element: <TripDetailsPage />
      }
    ]
  }
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;

import React, { useState, useEffect, createContext, useContext } from 'react';
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
import { GeneratingAnimation } from './features/landing/components/GeneratingAnimation';

/* ── Lightweight context: share pending destination + numDays across routes ── */
const GeneratingContext = createContext<{
  destination: string;
  setDestination: (d: string) => void;
  numDays: number;
  setNumDays: (n: number) => void;
}>({ destination: '', setDestination: () => {}, numDays: 3, setNumDays: () => {} });

const RootLayout: React.FC = () => {
  const theme        = useAppSelector(state => state.user.theme);
  const isGenerating = useAppSelector(state => state.dashboard.loading);
  const { destination, numDays } = useContext(GeneratingContext);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      <GeneratingAnimation isVisible={isGenerating} destination={destination} numDays={numDays} />
      <Outlet />
    </>
  );
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

  // While loading, return null — GeneratingAnimation in RootLayout covers the screen
  if (loading || !itinerary || !tripState) {
    return null;
  }

  return <Dashboard onReset={reset} />;
};

const LandingPageWithNavigate: React.FC = () => {
  const dispatch     = useAppDispatch();
  const navigate     = useNavigate();
  const isGenerating = useAppSelector(state => state.dashboard.loading);
  const { setDestination, setNumDays } = useContext(GeneratingContext);

  const handleGenerate = async (formData: TravelFormData) => {
    const days = (formData as any).numDays ?? 3;
    setDestination(formData.destination || '');
    setNumDays(days);
    try {
      await dispatch(generateAITrip(formData)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Itinerary generation failed', err);
      setDestination('');
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
  const [destination, setDestination] = useState('');
  const [numDays,     setNumDays]     = useState(3);

  return (
    <GeneratingContext.Provider value={{ destination, setDestination, numDays, setNumDays }}>
      <RouterProvider router={router} />
    </GeneratingContext.Provider>
  );
};

export default App;

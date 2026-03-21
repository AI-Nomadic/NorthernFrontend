import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureCollections from './components/FeatureCollections';
import ProvinceDiscovery from './components/ProvinceDiscovery';
import TravelForm from './components/TravelForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import Footer from './components/Footer';
import { ItineraryResponse, TravelFormData, TripVibe, TripState } from '../../types';
import { generateItinerary } from '../../services/api';

import './landing.css';

interface LandingPageProps {
    onGenerate: (trip: TripState) => void;
    loading: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGenerate, loading: parentLoading }) => {
    const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isLoading = parentLoading || localLoading;

    const handlePlanTrip = async (formData: TravelFormData) => {
        setLocalLoading(true);
        setError(null);
        try {
            // Option 1: Generate preview on landing page (as in northen-landing)
            const result = await generateItinerary(formData);
            setItinerary(result);

            // Option 2: Also trigger the parent's generation if we want to sync with dashboard
            // We need to map TravelFormData to TripState
            const startDate = formData.startDate;
            const endDate = formData.endDate;

            // Note: We don't call onGenerate immediately here so user can see the preview first.
            // Or we could have a "Start Full Planning" button in ItineraryDisplay.

            // Smooth scroll to results
            setTimeout(() => {
                document.getElementById('itinerary-results')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (err) {
            setError('Something went wrong generating your Canadian adventure. Please try again.');
        } finally {
            setLocalLoading(false);
        }
    };

    // Callback used when the user wants to go to the full dashboard, if applicable
    const handleGenerateFull = (formData: TravelFormData) => {
        const startDate = formData.startDate;
        const endDate = formData.endDate;

        let vibe = TripVibe.ADVENTURE;
        if (formData.budget === 'Luxury') vibe = TripVibe.LUXURY;
        if (formData.budget === 'Budget') vibe = TripVibe.BUDGET;

        onGenerate({
            destination: formData.destination,
            startDate,
            endDate,
            vibe,
            budget: formData.budget === 'Luxury' ? 5000 : (formData.budget === 'Budget' ? 1000 : 2500),
            travelers: 2
        });
    };

    return (
        <div className="min-h-screen landing-body bg-white dark:bg-slate-950 selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
            <Navbar />

            <main>
                <Hero onCtaClick={() => document.getElementById('plan-section')?.scrollIntoView({ behavior: 'smooth' })} />

                <section id="collections-section">
                    <FeatureCollections />
                </section>

                <section id="discover-section">
                    <ProvinceDiscovery />
                </section>

                <section id="plan-section" className="py-24 px-6 bg-white dark:bg-slate-900 transition-colors duration-300">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4"
                            >
                                Craft Your Northern Path
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
                            >
                                Our AI Travel Architect designs logistics-first itineraries.
                                Just tell us where you're heading in Canada.
                            </motion.p>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            <TravelForm onSubmit={handlePlanTrip} isLoading={isLoading} />
                        </div>
                    </div>
                </section>

                <AnimatePresence mode="wait">
                    {isLoading && (
                        <section className="py-12 px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                            <div className="max-w-7xl mx-auto">
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
                                >
                                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                    <p className="text-slate-600 dark:text-slate-400 font-medium">Drafting your custom Canadian path...</p>
                                </motion.div>
                            </div>
                        </section>
                    )}

                    {itinerary && !isLoading && (
                        <section id="itinerary-results" className="py-24 px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                            <div className="max-w-7xl mx-auto">
                                <ItineraryDisplay itinerary={itinerary} />

                                <div className="mt-12 flex justify-center">
                                    <button
                                        onClick={() => {
                                            // Extract data to move to dashboard
                                            const lastDest = itinerary.trip_title.split(' to ')[1] || itinerary.trip_title;
                                            onGenerate({
                                                destination: lastDest,
                                                startDate: new Date().toISOString().split('T')[0],
                                                endDate: new Date(Date.now() + itinerary.total_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                                vibe: TripVibe.ADVENTURE,
                                                budget: 2000,
                                                travelers: 2
                                            });
                                        }}
                                        className="px-8 py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 dark:hover:bg-blue-500 transition-all flex items-center gap-2"
                                    >
                                        Save & Customize in Dashboard
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {error && !isLoading && (
                        <section className="py-12 px-6">
                            <div className="max-w-3xl mx-auto">
                                <div className="bg-red-50 text-red-600 p-8 rounded-3xl border border-red-100 text-center">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </section>
                    )}
                </AnimatePresence>
            </main>

            <section id="footer-section">
                <Footer />
            </section>
        </div >
    );
};

export default LandingPage;

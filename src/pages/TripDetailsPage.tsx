import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Star, MapPin, Clock, DollarSign, Calendar, Mountain, CheckCircle, Navigation, Map, Compass, Edit3, Copy 
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../state';
import { fetchPublicTrips, cloneTrip, resetForkStatus } from '../state/slices/publicTripsSlice';
import { cn } from '../utils';

export const TripDetailsPage: React.FC = () => {
    const { tripId } = useParams<{ tripId: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    
    const { trips: publicTrips, loading, forkStatus, forkedTripId } = useAppSelector(state => state.publicTrips);
    const { isAuthenticated, email: currentUserEmail } = useAppSelector(state => state.user);
    const trip = publicTrips.find(t => t.id === tripId);

    const isOwner = trip?.ownerEmail === currentUserEmail;
    const isCollaborator = trip?.collaborators?.some(c => c.email === currentUserEmail);
    const isContributor = isOwner || isCollaborator;

    useEffect(() => {
        if (publicTrips.length === 0 && !loading) {
            dispatch(fetchPublicTrips());
        }
    }, [dispatch, publicTrips.length, loading]);

    useEffect(() => {
        if (forkStatus === 'success' && forkedTripId) {
            localStorage.setItem('northern_last_trip_id', forkedTripId);
            navigate('/dashboard');
            dispatch(resetForkStatus());
        }
    }, [forkStatus, forkedTripId, navigate, dispatch]);

    const handleClone = () => {
        if (!isAuthenticated) {
            // Save current path to redirect back after login
            navigate('/login', { state: { from: `/explore/trip/${tripId}` } });
            return;
        }
        if (tripId) {
            dispatch(cloneTrip(tripId));
        }
    };

    if (loading || (!trip && publicTrips.length === 0)) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#050505] text-white">
                <div className="flex flex-col items-center gap-4 text-slate-400">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold uppercase tracking-widest">Loading Journey...</p>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-[#050505] text-white">
                <p className="text-2xl font-bold mb-4">Trip not found.</p>
                <button 
                    onClick={() => navigate('/explore')} 
                    className="px-6 py-3 bg-purple-600 rounded-xl font-bold uppercase tracking-wider shadow-lg shadow-purple-900/50 hover:bg-purple-500 transition-colors"
                >
                    Back to Explore
                </button>
            </div>
        );
    }

    const formatDateRange = () => {
        if (!trip.itinerary || trip.itinerary.length === 0) return 'DATES TBD';
        const start = trip.itinerary[0]?.date;
        const end = trip.itinerary[trip.itinerary.length - 1]?.date;
        if (!start) return 'DATES TBD';
        if (!end || start === end) return new Date(start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        return `${new Date(start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${new Date(end).toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
    };

    const formatDateFull = (dateStr: string | null | undefined) => {
        if (!dateStr) return 'TBD';
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    };

    return (
        <div className="relative min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-purple-500/30">
            {/* Background Image with Blur and Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img 
                    src={trip.featuredImage || "https://images.unsplash.com/photo-1559511260-66a654ae982a"} 
                    alt="Background" 
                    className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transform origin-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/60 to-[#050505] opacity-90" />
            </div>

            {/* Header / Nav */}
            <header className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8 flex-1">
                    <button 
                        onClick={() => navigate('/explore')}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full transition-all text-white/50 hover:text-white group shrink-0"
                    >
                        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex-1 max-w-4xl border-l-2 border-purple-500/50 pl-6 md:pl-8">
                        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-4">
                            {trip.trip_title} ITINERARY
                        </h1>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-xs md:text-sm font-bold tracking-[0.2em] text-purple-200/60 uppercase">
                            <div>{formatDateRange()}</div>
                            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/20" />
                            <div>A CURATED ADVENTURE BY {trip.ownerEmail ? trip.ownerEmail.split('@')[0] : 'AINOMADIC'}</div>
                        </div>
                    </div>
                </div>
                
                {/* Actions */}
                {!isContributor && (
                    <button 
                        onClick={handleClone}
                        disabled={forkStatus === 'loading'}
                        className="shrink-0 px-8 py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-xl font-bold text-sm tracking-wider uppercase transition-all text-white flex items-center gap-3 shadow-xl shadow-purple-900/20 active:scale-95"
                    >
                        {forkStatus === 'loading' ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                        {forkStatus === 'loading' ? 'Cloning Journey...' : 'Clone & Edit'}
                    </button>
                )}
            </header>

            {/* Timeline View */}
            <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-12 pb-32">
                {trip.itinerary?.map((day, idx) => {
                    const hasItems = (day.activities && day.activities.length > 0) || day.accommodation;
                    
                    if (!hasItems) return null;

                    return (
                        <div key={day.id || idx} className="relative mb-24 last:mb-0">
                            
                            {/* Day Header */}
                            <div className="mb-10 pl-6 md:pl-0 md:text-center relative">
                                <span className="text-xs font-black tracking-[0.3em] uppercase text-purple-400/80 block mb-2 print:text-purple-700">
                                    DAY {day.dayNumber} - {formatDateFull(day.date)}
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6 print:text-black">
                                    {day.theme || `Day ${day.dayNumber} Explorations`}
                                </h2>
                            </div>

                            {/* Timeline Track (Continuous vertical line) */}
                            <div className="absolute left-6 md:left-[180px] top-32 bottom-[-100px] w-0.5 bg-gradient-to-b from-purple-500/50 via-white/10 to-transparent hidden md:block" />

                            <div className="space-y-12">
                                {/* Accommodation Card */}
                                {day.accommodation ? (
                                    <div className="relative flex flex-col md:flex-row gap-6 md:gap-12 pl-6 md:pl-0 group">
                                        <div className="hidden md:block w-[140px] text-right pt-6 shrink-0 relative">
                                            {/* Accommodation Card Line Dot connector */}
                                            <div className="absolute right-[-45px] top-8 w-3 h-3 rounded-full bg-black border-2 border-purple-400 z-10 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                            {/* Left visual could be empty here or specific text if needed for Accommodations */}
                                        </div>

                                        <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden transition-all hover:bg-white/10 hover:border-purple-500/30 shadow-2xl print:bg-white print:border-slate-200 print:shadow-none">
                                            {/* Decorative shine */}
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -mt-20 -mr-20 pointer-events-none print:hidden" />
                                            
                                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <MapPin className="w-4 h-4 text-purple-400 print:text-purple-600" />
                                                        <h3 className="text-xl font-bold text-white print:text-black">{day.accommodation.hotelName || 'Mystery Hotel'}</h3>
                                                        {day.accommodation.rating && (
                                                            <div className="flex items-center gap-1 ml-auto md:ml-4 bg-black/30 px-2 py-1 rounded-md print:bg-slate-100">
                                                                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                                                                <span className="text-xs font-bold text-white/90 print:text-black">{day.accommodation.rating}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-medium text-white/50 mb-3 flex items-center gap-2 print:text-slate-500">
                                                        {day.accommodation.pricePerNight && <span>{trip.currency || '$'}{day.accommodation.pricePerNight} / night</span>}
                                                        <span className="w-1 h-1 rounded-full bg-white/30 print:bg-slate-300" />
                                                        <span className="truncate">{day.accommodation.address}</span>
                                                    </div>
                                                    <p className="text-sm text-white/70 mb-5 leading-relaxed print:text-slate-700">
                                                        {day.accommodation.description || 'A relaxing place to stay for the night.'}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {day.accommodation.amenities?.map((amenity, i) => (
                                                            <span key={i} className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-white/10 rounded-full bg-black/20 text-white/60 print:border-slate-200 print:bg-slate-50 print:text-slate-600">
                                                                {amenity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="md:w-[200px] shrink-0 bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col justify-center print:bg-slate-50 print:border-slate-100">
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400/80 mb-2 block print:text-purple-700">Contact & Address</span>
                                                    {day.accommodation.contactNumber && (
                                                        <div className="text-xs text-white/80 mb-1 print:text-slate-800">Contact: {day.accommodation.contactNumber}</div>
                                                    )}
                                                    <div className="text-xs text-white/60 mb-3 leading-tight print:text-slate-600">
                                                        {day.accommodation.address}
                                                    </div>
                                                    <div className="mt-auto pt-3 border-t border-white/10 print:border-slate-200">
                                                        <span className="text-[10px] uppercase font-bold text-white/40 flex items-center gap-2 print:text-slate-400">
                                                            {day.accommodation.bookingStatus === 'confirmed' ? (
                                                                <><CheckCircle className="w-3 h-3 text-green-400 print:text-green-600" /> Booking Confirmed</>
                                                            ) : (
                                                                <><Navigation className="w-3 h-3 text-yellow-400 print:text-yellow-600" /> Booking Pending</>
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative flex flex-col md:flex-row gap-6 md:gap-12 pl-6 md:pl-0">
                                        <div className="hidden md:block w-[140px] text-right pt-6 shrink-0 relative">
                                            <div className="absolute right-[-45px] top-8 w-3 h-3 rounded-full bg-black border-2 border-white/30 z-10" />
                                        </div>
                                        <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden transition-all shadow-xl opacity-60">
                                            <h3 className="text-sm font-bold tracking-widest uppercase text-white/80 mb-2">Logistics Card</h3>
                                            <p className="text-sm text-white/60">TRAVEL DAY - No accommodation booked for Day {day.dayNumber}.</p>
                                        </div>
                                    </div>
                                )}

                                {/* Activities List */}
                                {day.activities?.map((activity, aIdx) => (
                                    <div key={activity.id || aIdx} className="relative flex flex-col md:flex-row gap-6 md:gap-12 pl-6 md:pl-0 group">
                                        {/* Left col: Image + Time string (Desktop) */}
                                        <div className="hidden md:flex flex-col items-end w-[140px] text-right pt-4 shrink-0 relative pr-0">
                                            <div className="absolute right-[-45px] top-6 w-3 h-3 rounded-full bg-black border-2 border-purple-500/70 z-10 group-hover:bg-purple-500/20 transition-colors" />
                                            <span className="text-[11px] font-bold tracking-widest text-white/70 uppercase">
                                                {activity.timeSlot?.start || 'TBD'} - {activity.timeSlot?.end || 'LATER'}
                                            </span>
                                            
                                            {/* Preview Image (if available) - styled to float left like in the design */}
                                            {activity.imageGallery && activity.imageGallery.length > 0 && (
                                                <div className="absolute right-[190px] top-0 w-48 h-28 rounded-xl overflow-hidden shadow-2xl border border-white/10 transform -translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-500 will-change-transform z-20 pointer-events-none xl:block hidden hidden">
                                                    <img src={activity.imageGallery[0]} alt={activity.title} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Mobile Time Header */}
                                        <div className="md:hidden flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-purple-400" />
                                            <span className="text-[11px] font-bold tracking-widest text-purple-300 uppercase">
                                                {activity.timeSlot?.start || 'TBD'} - {activity.timeSlot?.end || 'LATER'}
                                            </span>
                                        </div>

                                        {/* Activity Card */}
                                        <div className="flex-1 bg-[#b59e74]/10 md:bg-gradient-to-r md:from-[#b59e74]/20 md:to-[#b59e74]/5 border border-[#b59e74]/30 backdrop-blur-md rounded-xl md:rounded-r-none relative flex overflow-hidden group-hover:border-[#b59e74]/60 transition-colors print:bg-[#b59e74]/5 print:border-slate-200 print:text-black print:backdrop-blur-none">
                                            
                                            {/* Activity Info */}
                                            <div className="flex-1 p-5 md:p-6 z-10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Compass className="w-4 h-4 text-[#d4c19c] print:text-[#b59e74]" />
                                                    <h3 className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight print:text-black">{activity.title}</h3>
                                                </div>
                                                <p className="text-sm text-white/70 mb-4 pr-4 print:text-slate-700">
                                                    {activity.description}
                                                </p>
                                                
                                                <div className="flex flex-wrap items-center gap-5 text-sm font-bold text-white/60 print:text-slate-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4 print:text-slate-400" />
                                                        <span>{activity.durationMinutes} mins</span>
                                                    </div>
                                                    {activity.cost_estimate !== undefined && (
                                                        <div className="flex items-center gap-1.5">
                                                            <DollarSign className="w-4 h-4 print:text-slate-400" />
                                                            <span>{activity.cost_estimate} {trip.currency || 'CAD'}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1.5 basis-full md:basis-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t border-white/10 md:border-0 w-full md:w-auto print:border-slate-100">
                                                        <MapPin className="w-4 h-4 print:text-slate-400" />
                                                        <span className="truncate">{activity.location}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sticky Right Box (Contact info/map link) */}
                                            <div className="hidden md:flex w-[200px] shrink-0 bg-black/60 border-l border-white/10 flex-col justify-center p-5 z-10 print:bg-slate-50 print:border-slate-100">
                                                {activity.imageGallery?.[0] ? (
                                                    <div className="absolute inset-0 opacity-20 pointer-events-none print:hidden">
                                                        <img src={activity.imageGallery[0]} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                ) : null}
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-2 relative z-10 block block print:text-slate-400">Details & Info</span>
                                                <div className="text-xs text-white/90 relative z-10 font-medium print:text-slate-800">Status: {activity.status || 'Planned'}</div>
                                                <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-purple-400 cursor-pointer hover:text-purple-300 relative z-10 flex items-center gap-1 print:text-purple-700 print:hidden">
                                                    <Map className="w-3 h-3" /> Map Link
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
};

export default TripDetailsPage;

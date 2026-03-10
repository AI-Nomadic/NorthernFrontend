import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    PanelLeftOpen, 
    Filter, 
    Grid, 
    ChevronLeft,
    Search,
    User
} from 'lucide-react';
import { useAppSelector } from '../state';
import { ExploreSidebar } from '../features/explore/components/ExploreSidebar';
import { TripTile } from '../features/explore/components/TripTile';
import { cn } from '../utils';

// Placeholder data for Trip Tiles
const placeholderTrips = [
  {
    id: '1',
    title: 'Rocky Mountain Adventure',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    location: 'Banff, Alberta',
    duration: '7 Days',
    price: '$1,250',
    rating: 4.8,
    reviews: 124
  },
  {
    id: '2',
    title: 'Quebec City Winter Escape',
    image: 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?auto=format&fit=crop&q=80&w=800',
    location: 'Quebec City, QC',
    duration: '4 Days',
    price: '$850',
    rating: 4.9,
    reviews: 86
  },
  {
    id: '3',
    title: 'Vancouver Island Coastal Tour',
    image: 'https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?auto=format&fit=crop&q=80&w=800',
    location: 'Tofino, BC',
    duration: '5 Days',
    price: '$1,100',
    rating: 4.7,
    reviews: 210
  },
  {
    id: '4',
    title: 'Toronto Urban Exploration',
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800',
    location: 'Toronto, Ontario',
    duration: '3 Days',
    price: '$600',
    rating: 4.6,
    reviews: 154
  },
  {
    id: '5',
    title: 'Maritime Heritage Trail',
    image: 'https://images.unsplash.com/photo-1531366930499-41f66950574f?auto=format&fit=crop&q=80&w=800',
    location: 'Halifax, NS',
    duration: '6 Days',
    price: '$980',
    rating: 4.8,
    reviews: 95
  },
  {
    id: '6',
    title: 'Niagara Falls & Wine Country',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
    location: 'Niagara Falls, ON',
    duration: '2 Days',
    price: '$450',
    rating: 4.9,
    reviews: 320
  }
];

export const ExplorePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Derived state from URL params
    const appliedCategory = searchParams.get('category');
    const appliedProvince = searchParams.get('province');

    // Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('explore_sidebar_open');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('explore_sidebar_open', JSON.stringify(sidebarOpen));
    }, [sidebarOpen]);

    // Handle Window Resize
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleApplyFilters = (category: string | null, province: string | null) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (province) params.set('province', province);
        setSearchParams(params);
        
        // On mobile, close sidebar after apply
        if (isMobile) setSidebarOpen(false);
    };

    // Filtered Trips (client-side for now)
    const filteredTrips = placeholderTrips.filter(trip => {
        const matchesCategory = !appliedCategory || trip.title.toLowerCase().includes(appliedCategory.toLowerCase());
        const matchesProvince = !appliedProvince || trip.location.toLowerCase().includes(appliedProvince.toLowerCase());
        return matchesCategory && matchesProvince;
    });

    return (
        <div className="flex h-screen w-full bg-[#FCFCFC] dark:bg-surface-a0 overflow-hidden">
            
            {/* Desktop Sidebar */}
            <div className={cn(
                "hidden md:flex flex-shrink-0 h-full transition-all duration-500 ease-in-out z-40",
                sidebarOpen ? "w-[320px] translate-x-0 opacity-100" : "w-0 -translate-x-full opacity-0 overflow-hidden"
            )}>
                <ExploreSidebar 
                    isOpen={sidebarOpen} 
                    onToggle={toggleSidebar} 
                    appliedCategory={appliedCategory}
                    appliedProvince={appliedProvince}
                    onApply={handleApplyFilters}
                />
            </div>

            {/* Mobile Sidebar (Drawer) */}
            {isMobile && (
                <>
                    <div 
                        className={cn(
                            "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden",
                            sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                        )}
                        onClick={toggleSidebar}
                    />
                    <div className={cn(
                        "fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-surface-a0 z-50 transform transition-transform duration-300 ease-in-out md:hidden",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}>
                        <ExploreSidebar 
                            isOpen={true} 
                            onToggle={toggleSidebar} 
                            appliedCategory={appliedCategory}
                            appliedProvince={appliedProvince}
                            onApply={handleApplyFilters}
                        />
                    </div>
                </>
            )}

            {/* Main Layout Area */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-[#FCFCFC] dark:bg-surface-a0">
                {/* Navigation Header */}
                <header className="flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-[#050505] backdrop-blur-md border-b border-white/20 dark:border-surface-a20 relative shadow-sm dark:shadow-md shrink-0 z-30">
                    <div className="flex items-center gap-4">
                        {!sidebarOpen && (
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-a20 transition-colors text-gray-500 dark:text-gray-300"
                                title="Open Categories"
                            >
                                <PanelLeftOpen className="h-5 w-5" />
                            </button>
                        )}
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => navigate('/')}
                                className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-a20 transition-colors text-gray-500 dark:text-gray-400"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
                                    Discover Journeys
                                </h1>
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-800">
                                    {appliedCategory || appliedProvince ? 'Filtered' : 'Explore'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center bg-slate-100 dark:bg-surface-a10 border border-slate-200 dark:border-surface-a20 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
                            <Search className="w-4 h-4 text-slate-400 mr-2" />
                            <input 
                                type="text" 
                                placeholder="Find your next destination..." 
                                className="bg-transparent border-none outline-none text-sm dark:text-white w-64"
                            />
                        </div>
                        
                        <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-a20 rounded-lg transition-colors">
                            <Grid className="h-5 w-5" />
                        </button>
                        <button className="p-2 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/30 hover:bg-purple-700 transition-all">
                            <User className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar relative">
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-200/20 dark:bg-purple-900/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-[120px]" />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                                    {appliedCategory ? `${appliedCategory} Collection` : 'Curated Adventure'}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">
                                    Displaying {filteredTrips.length} amazing itineraries {appliedProvince ? `in ${appliedProvince}` : 'for your style'}.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                { (appliedCategory || appliedProvince) && (
                                    <button 
                                        onClick={() => setSearchParams({})}
                                        className="text-xs font-bold text-slate-400 hover:text-purple-500 transition-colors uppercase tracking-widest mr-2"
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-a10 border border-slate-200 dark:border-surface-a20 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-surface-a20 transition-all">
                                    <Filter className="w-4 h-4" />
                                    Filter
                                </button>
                                <select className="px-4 py-2 bg-white dark:bg-surface-a10 border border-slate-200 dark:border-surface-a20 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20">
                                    <option>Most Popular</option>
                                    <option>Newest First</option>
                                    <option>Price: Low to High</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredTrips.map((trip) => (
                                <TripTile key={trip.id} {...trip} />
                            ))}
                            {filteredTrips.length === 0 && (
                                <div className="col-span-full py-24 text-center">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters to find more adventures.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ExplorePage;

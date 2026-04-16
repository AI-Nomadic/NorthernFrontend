import React from 'react';
import {
    PanelLeftOpen,
    Plus,
    User
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { useAppDispatch } from '../../../state';
import { useNavigate } from 'react-router-dom';

interface GalleryHeaderProps {
    sidebarOpen: boolean;
    onSidebarToggle: () => void;
    onCreateTrip: () => void;
    invitationCount: number;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
    sidebarOpen,
    onSidebarToggle,
    onCreateTrip,
    invitationCount
}) => {
    const email = useSelector((state: RootState) => state.user.email);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-[#050505] backdrop-blur-md border-b border-white/20 dark:border-surface-a20 relative z-30 sticky top-0 shadow-sm dark:shadow-md">
            {/* Left Section: Sidebar Toggle & Title */}
            <div className="flex items-center gap-4">
                {!sidebarOpen && (
                    <button
                        onClick={onSidebarToggle}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-surface-a20 transition-colors text-gray-500 dark:text-gray-300"
                        title="Open Sidebar"
                    >
                        <PanelLeftOpen className="h-5 w-5" />
                    </button>
                )}

                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">
                        My Collection
                    </h1>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary-a30 text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                        Library
                    </span>
                </div>
            </div>



            {/* Right Section: Actions & Profile */}
            <div className="flex items-center gap-3">
                {/* Create New Trip Button */}
                <button
                    onClick={onCreateTrip}
                    className="relative overflow-hidden flex items-center gap-2 px-3 py-2 text-sm font-medium text-white rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #da09de 0%, #8b5cf6 100%)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                    <Plus className="h-4 w-4 relative z-10" />
                    <span className="hidden sm:inline relative z-10">New Trip</span>
                </button>

            </div>
        </div>
    );
};

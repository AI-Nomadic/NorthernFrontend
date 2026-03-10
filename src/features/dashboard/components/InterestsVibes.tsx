import React, { useState } from 'react';
import { Heart, X, Sparkles } from 'lucide-react';
import { cn } from '../../../utils';

// The full pool of 15 interests
const INTERESTS_POOL = [
  "Nature", "Local Food", "Hidden Gems", "Nightlife", "Architecture", 
  "Museums", "Hiking", "Photography", "Shopping", "Festivals", 
  "Beaches", "Mountains", "History", "Art Galleries", "Street Food"
];

export const InterestsVibes: React.FC = () => {
    // We'll track the indices of active interests relative to the pool
    // and the global "next available" index
    const [activeTags, setActiveTags] = useState(INTERESTS_POOL.slice(0, 3));
    const [nextIndex, setNextIndex] = useState(3);

    const handleDismiss = (tagToReplace: string) => {
        // Get the next item from the pool
        const newItem = INTERESTS_POOL[nextIndex];
        
        // Update the active tags: replace the dismissed one with the new one
        setActiveTags(prev => prev.map(tag => tag === tagToReplace ? newItem : tag));
        
        // Advance the pool index (looping back to 0 if we hit the end)
        setNextIndex((nextIndex + 1) % INTERESTS_POOL.length);
    };

    return (
        <div className="w-full space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-500 fill-purple-500/20" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Interests & Vibes
                </h3>
            </div>

            {/* Container Card */}
            <div className="bg-[#0f1117] dark:bg-black/40 rounded-2xl p-4 border border-white/5 shadow-xl">
                <div className="flex flex-wrap items-center gap-3">
                    {activeTags.map((interest) => (
                        <div 
                            key={interest}
                            className="group flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 transition-all rounded-full border border-white/5 backdrop-blur-md"
                        >
                            <span className="text-xs font-medium text-white/90">
                                {interest}
                            </span>
                            <button 
                                onClick={() => handleDismiss(interest)}
                                className="p-0.5 rounded-full hover:bg-white/20 text-white/40 hover:text-white transition-colors"
                                title={`Dismiss ${interest}`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    {/* AI Feature / Add Interest Pill */}
                    <button 
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 transition-all rounded-full border border-blue-500/20 group"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-blue-400">
                            AI Features
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

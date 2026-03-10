import React, { useState, useRef } from 'react';
import { Calendar, MapPin, DollarSign, Heart, Sparkles, ChevronDown, Check } from 'lucide-react';
import { TravelFormData } from '../types';
import { cn } from '../../../utils';
import { useClickOutside } from '../../../hooks/useClickOutside';

interface TravelFormProps {
  onSubmit: (data: TravelFormData) => void;
  isLoading: boolean;
}

const INTERESTS_POOL = [
  "Nature", "Local Food", "Hidden Gems", "Nightlife", "Architecture", 
  "Museums", "Hiking", "Photography", "Shopping", "Festivals", 
  "Beaches", "Mountains", "History", "Art Galleries", "Street Food"
];

const BUDGET_OPTIONS = ["Budget", "Standard", "Luxury"];

const DayStepper: React.FC<{
    value: number;
    onChange: (val: number) => void;
}> = ({ value, onChange }) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Duration
            </label>
            <div className="flex items-center gap-3 p-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl">
                <button
                    type="button"
                    onClick={() => onChange(Math.max(1, value - 1))}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary/50 transition-all active:scale-95 shadow-sm"
                >
                    <span className="text-xl font-bold">−</span>
                </button>
                <div className="flex-1 text-center">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {value} <span className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">{value === 1 ? 'Day' : 'Days'}</span>
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => onChange(Math.min(14, value + 1))}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary/50 transition-all active:scale-95 shadow-sm"
                >
                    <span className="text-xl font-bold">+</span>
                </button>
            </div>
        </div>
    );
};

const CustomDropdown: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: string;
    options: string[];
    onChange: (val: string) => void;
}> = ({ label, icon, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                {icon} {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 transition-all text-left",
                    isOpen ? "ring-2 ring-primary border-transparent" : "hover:border-slate-300 dark:hover:border-slate-600"
                )}
            >
                <span className="font-semibold text-slate-900 dark:text-white">
                    {value}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => {
                                onChange(opt);
                                setIsOpen(false);
                            }}
                            className={cn(
                                "w-full flex items-center justify-between px-5 py-3 text-sm font-medium transition-colors",
                                value === opt 
                                    ? "text-primary bg-primary/5" 
                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            {opt}
                            {value === opt && <Check className="w-4 h-4" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const TravelForm: React.FC<TravelFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<TravelFormData>({
    destination: '',
    days: 3,
    budget: 'Standard',
    interests: INTERESTS_POOL.slice(0, 4).join(', ')
  });

  const [activeTags, setActiveTags] = useState(INTERESTS_POOL.slice(0, 4));
  const [nextInterestIndex, setNextInterestIndex] = useState(4);

  const handleInterestDismiss = (tagToReplace: string) => {
    const newItem = INTERESTS_POOL[nextInterestIndex];
    const newTags = activeTags.map(tag => tag === tagToReplace ? newItem : tag);
    
    setActiveTags(newTags);
    setNextInterestIndex((nextInterestIndex + 1) % INTERESTS_POOL.length);
    
    setFormData(prev => {
      const currentInterests = prev.interests.trim();
      const needsComma = currentInterests.length > 0 && !currentInterests.endsWith(',');
      const formattedAppend = needsComma ? `, ${tagToReplace}` : tagToReplace;
      return { ...prev, interests: currentInterests + formattedAppend };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white dark:border-slate-800 space-y-8 transition-all duration-300">
      
      {/* Destination Field */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
          <MapPin className="w-3.5 h-3.5 text-primary" /> Destination
        </label>
        <div className="relative group">
            <input
                required
                type="text"
                placeholder="Where to next?"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white placeholder:text-slate-400 font-semibold italic md:text-lg"
            />
            <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
        </div>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DayStepper
            value={formData.days}
            onChange={(val) => setFormData({ ...formData, days: val })}
        />
        <CustomDropdown
            label="Budget"
            icon={<DollarSign className="w-3.5 h-3.5 text-primary" />}
            value={formData.budget}
            options={BUDGET_OPTIONS}
            onChange={(val) => setFormData({ ...formData, budget: val as any })}
        />
      </div>

      {/* Interests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pl-1">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-primary" /> Interests & Vibes
          </label>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
             <Sparkles className="w-3 h-3 text-blue-500" />
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">AI Recs</span>
          </div>
        </div>

        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                {activeTags.map((interest) => (
                    <button 
                        key={interest}
                        type="button"
                        onClick={() => handleInterestDismiss(interest)}
                        className="group flex items-center gap-1.5 px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-primary text-slate-600 dark:text-slate-300 hover:text-white transition-all rounded-full border border-slate-200 dark:border-slate-700 hover:border-transparent shadow-sm hover:shadow-lg hover:shadow-primary/30"
                    >
                        <span className="text-[10px] font-bold tracking-wide italic leading-none">+ {interest}</span>
                    </button>
                ))}
            </div>

            <div className="relative group">
                <textarea
                    rows={3}
                    placeholder="Describe your perfect vibe... (e.g. coffee crawls, brutalist architecture, sunset spots)"
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                    className="w-full px-6 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none font-medium italic text-sm leading-relaxed"
                />
                <div className="absolute bottom-4 right-4 text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest pointer-events-none group-focus-within:opacity-0 transition-opacity">
                    Personalize your path
                </div>
            </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        disabled={isLoading}
        type="submit"
        className="w-full py-5 bg-slate-900 dark:bg-primary text-white rounded-2xl font-black text-lg hover:bg-slate-800 dark:hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 dark:shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Building Itinerary...</span>
          </div>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-yellow-300 group-hover:rotate-12 transition-transform" />
            <span className="uppercase tracking-widest">Generate My Path</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] pt-2 opacity-60">
        <span className="w-4 h-px bg-slate-200 dark:bg-slate-800" />
        Powered by Northern AI
        <span className="w-4 h-px bg-slate-200 dark:bg-slate-800" />
      </div>
    </form>
  );
};

export default TravelForm;

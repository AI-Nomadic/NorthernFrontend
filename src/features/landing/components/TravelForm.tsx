import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, DollarSign, Heart, Sparkles, ChevronDown, Check } from 'lucide-react';
import { TravelFormData } from '../../../types';

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

const DateRangePicker: React.FC<{
    startDate: string;
    endDate: string;
    onChange: (start: string, end: string) => void;
}> = ({ startDate, endDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    const toLocalISO = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const start = new Date(startDate.replace(/-/g, '/'));
    const end = new Date(endDate.replace(/-/g, '/'));

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const [currentMonth, setCurrentMonth] = useState(new Date(start.getFullYear(), start.getMonth(), 1));

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const days = [];
    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));

    const handleDateClick = (date: Date) => {
        const dateStr = toLocalISO(date);
        if (!startDate || (startDate && endDate && startDate !== endDate)) {
            onChange(dateStr, dateStr);
        } else {
            const d1 = new Date(startDate.replace(/-/g, '/'));
            if (date < d1) {
                onChange(dateStr, startDate);
            } else {
                onChange(startDate, dateStr);
            }
        }
    };

    const isSelected = (date: Date) => {
        const dateStr = toLocalISO(date);
        return dateStr === startDate || dateStr === endDate;
    };

    const isInRange = (date: Date) => {
        const dStr = toLocalISO(date);
        return dStr > startDate && dStr < endDate;
    };

    return (
        <div className="space-y-2 relative" ref={containerRef}>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-1">
                <Calendar className="w-3.5 h-3.5 text-primary" /> Trip Dates
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
                    {formatDate(start)} — {formatDate(end)}
                </span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden p-4 min-w-[300px]"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <button 
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
                            >
                                ←
                            </button>
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <button 
                                type="button"
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
                            >
                                →
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center mb-1">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((date, i) => (
                                <div key={i} className="aspect-square relative flex items-center justify-center">
                                    {date && (
                                        <>
                                            {isInRange(date) && (
                                                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20" />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDateClick(date)}
                                                className={cn(
                                                    "w-8 h-8 rounded-full text-xs font-semibold transition-all relative z-10",
                                                    isSelected(date) 
                                                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" 
                                                        : isInRange(date)
                                                            ? "text-primary hover:bg-primary/20"
                                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                                )}
                                            >
                                                {date.getDate()}
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
                    >
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TravelForm: React.FC<TravelFormProps> = ({ onSubmit, isLoading }) => {
  const getInitialDates = () => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 3);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const initialDates = getInitialDates();

  const [formData, setFormData] = useState<TravelFormData>({
    destination: '',
    startDate: initialDates.startDate,
    endDate: initialDates.endDate,
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
    
    // Calculate total days and month
    const start = new Date(formData.startDate.replace(/-/g, '/'));
    const end = new Date(formData.endDate.replace(/-/g, '/'));
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const numDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const month = start.toLocaleDateString('en-US', { month: 'long' });

    onSubmit({
        ...formData,
        numDays,
        month
    });
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
        <DateRangePicker
            startDate={formData.startDate}
            endDate={formData.endDate}
            onChange={(start, end) => setFormData({ ...formData, startDate: start, endDate: end })}
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

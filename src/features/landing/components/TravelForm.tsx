
import React, { useState } from 'react';
import { Calendar, MapPin, DollarSign, Heart, Sparkles } from 'lucide-react';
import { TravelFormData } from '../types';

interface TravelFormProps {
  onSubmit: (data: TravelFormData) => void;
  isLoading: boolean;
}

const TravelForm: React.FC<TravelFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<TravelFormData>({
    destination: '',
    days: 3,
    budget: 'Standard',
    interests: 'Nature, Local Food, Hidden Gems'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] card-shadow border border-slate-100 dark:border-slate-800 space-y-6 transition-colors duration-300">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" /> Destination
        </label>
        <input
          required
          type="text"
          placeholder="e.g. Banff, Quebec City, Tofino"
          value={formData.destination}
          onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Duration
          </label>
          <select
            value={formData.days}
            onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white appearance-none"
          >
            {[1, 2, 3, 4, 5, 7, 10, 14].map(d => (
              <option key={d} value={d} className="dark:bg-slate-900">{d} {d === 1 ? 'Day' : 'Days'}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" /> Budget
          </label>
          <select
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value as any })}
            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white appearance-none"
          >
            <option value="Budget" className="dark:bg-slate-900">Budget</option>
            <option value="Standard" className="dark:bg-slate-900">Standard</option>
            <option value="Luxury" className="dark:bg-slate-900">Luxury</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" /> Interests & Vibes
        </label>
        <textarea
          rows={3}
          placeholder="e.g. Hiking, craft beer, museums, kid-friendly"
          value={formData.interests}
          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
          className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
        />
      </div>

      <button
        disabled={isLoading}
        type="submit"
        className="w-full py-5 bg-slate-900 dark:bg-primary text-white rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <>Drafting...</>
        ) : (
          <>
            <Sparkles className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
            Generate My Path
          </>
        )}
      </button>

      <p className="text-xs text-slate-400 text-center">
        Powered by Gemini 3. Pro-grade logistics enabled.
      </p>
    </form>
  );
};

export default TravelForm;

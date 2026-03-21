
import React from 'react';
import { motion } from 'framer-motion';
// Fixed: Added missing Sparkles import to lucide-react icons
import { Clock, MapPin, DollarSign, Coffee, Camera, Mountain, Bus, Bed, Sparkles } from 'lucide-react';
import { ItineraryResponse, Activity } from '../../../types';


interface ItineraryDisplayProps {
  itinerary: ItineraryResponse;
}

const CategoryIcon = ({ category }: { category: Activity['category'] }) => {
  switch (category) {
    case 'Food': return <Coffee className="w-4 h-4 text-orange-500" />;
    case 'Sightseeing': return <Camera className="w-4 h-4 text-primary" />;
    case 'Adventure': return <Mountain className="w-4 h-4 text-green-500" />;
    case 'Transport': return <Bus className="w-4 h-4 text-slate-500" />;
    case 'Lodging': return <Bed className="w-4 h-4 text-purple-500" />;
    default: return <MapPin className="w-4 h-4 text-slate-400" />;
  }
};

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = ({ itinerary }) => {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{itinerary.trip_title}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            {itinerary.total_days} Days in Canada • Estimated in {itinerary.currency}
          </p>
        </div>
        <button className="px-6 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
          Save to PDF
        </button>
      </div>

      <div className="space-y-10">
        {itinerary.itinerary.map((dayPlan, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20 dark:shadow-none">
                  {dayPlan.dayNumber}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">{dayPlan.theme}</h3>
                  {itinerary.location?.province && (
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">
                      {itinerary.location.province}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid gap-4 ml-6 pl-10 border-l-2 border-slate-100 dark:border-slate-800 pb-2">
              {dayPlan.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 card-shadow hover:border-primary transition-colors group relative"
                >
                  <div className="absolute left-[-41px] top-6 w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-950" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400">
                        <CategoryIcon category={activity.category} />
                        {activity.category}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      ~ {itinerary.currency} {activity.cost_estimate}
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{activity.title}</h4>
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-400 dark:text-slate-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    {activity.location}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{activity.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {itinerary.sidebar_suggestions && (
        <div className="mt-16 p-8 bg-primary/5 dark:bg-primary/10 rounded-[2.5rem] border border-primary/20 dark:border-primary/30">
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6" /> Northern Path Expert Tips
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {itinerary.sidebar_suggestions.map((tip, i) => (
              <div key={i} className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-2xl">
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">{tip.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{tip.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryDisplay;

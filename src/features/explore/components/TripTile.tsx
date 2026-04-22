import React from 'react';
import { Star, Clock, DollarSign, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface TripTileProps {
  id: string;
  title: string;
  image: string;
  location: string;
  duration: string;
  price: string;
  rating: number;
  reviews: number;
}

export const TripTile: React.FC<TripTileProps> = ({
  id,
  title,
  image,
  location,
  duration,
  price,
  rating,
  reviews
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group bg-white dark:bg-surface-a10 rounded-[2rem] border border-slate-200 dark:border-surface-a20 overflow-hidden hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-700/50 transition-all flex flex-col h-full"
    >
      {/* Image Area */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Floating Badges */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/50 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-[11px] font-bold text-slate-800 dark:text-white">{rating}</span>
        </div>
        
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="bg-purple-600 px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-purple-500/30">
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">{duration}</span>
            </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">
            {title}
            </h3>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{location}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-surface-a20 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Trip Total</span>
            <div className="flex items-center text-slate-900 dark:text-white">
                <span className="text-xl font-black">{price}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate(`/explore/trip/${id}`)}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-600 dark:hover:bg-purple-500 dark:hover:text-white transition-all shadow-md"
          >
            View Trip
          </button>
        </div>
      </div>
    </motion.div>
  );
};

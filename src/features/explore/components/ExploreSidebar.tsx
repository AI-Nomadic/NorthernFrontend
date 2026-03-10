import React, { useState } from 'react';
import { Sparkles, PanelLeftClose, Mountain, Sun, Palmtree, Building2, Ticket, Search, MapPin, Map } from 'lucide-react';
import { cn } from '../../../utils';

interface Category {
  title: string;
  icon: React.ReactNode;
  image: string;
}

const categories: Category[] = [
  {
    title: "Adventure",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
    icon: <Mountain className="w-4 h-4" />
  },
  {
    title: "Summer Bliss",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800",
    icon: <Sun className="w-4 h-4" />
  },
  {
    title: "Coastal Escape",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    icon: <Palmtree className="w-4 h-4" />
  },
  {
    title: "Urban Pulse",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800",
    icon: <Building2 className="w-4 h-4" />
  },
  {
    title: "Themed Journeys",
    image: "https://images.unsplash.com/photo-1531366930499-41f66950574f?auto=format&fit=crop&q=80&w=800",
    icon: <Ticket className="w-4 h-4" />
  }
];

const provinces = [
  { title: "Alberta", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "British Columbia", image: "https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "Manitoba", image: "https://images.unsplash.com/photo-1563823455850-99bc489f029a?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "New Brunswick", image: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "Newfoundland", image: "https://images.unsplash.com/photo-1551806332-602928503852?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "Nova Scotia", image: "https://images.unsplash.com/photo-1531366930499-41f66950574f?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "Ontario", image: "https://images.unsplash.com/photo-1503970993930-adaba1879ba4?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "Prince Edward Island", image: "https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "Quebec", image: "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "Saskatchewan", image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "Northwest Territories", image: "https://images.unsplash.com/photo-1531366930499-41f66950574f?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "Nunavut", image: "https://images.unsplash.com/photo-1531366930499-41f66950574f?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> },
  { title: "Yukon", image: "https://images.unsplash.com/photo-1531366930499-41f66950574f?auto=format&fit=crop&q=80&w=800", icon: <MapPin className="w-3 h-3" /> }
];

interface ExploreSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  // Applied States
  appliedCategory: string | null;
  appliedProvince: string | null;
  onApply: (category: string | null, province: string | null) => void;
}

export const ExploreSidebar: React.FC<ExploreSidebarProps> = ({ 
  isOpen, 
  onToggle,
  appliedCategory,
  appliedProvince,
  onApply
}) => {
  const [pendingCategory, setPendingCategory] = useState<string | null>(appliedCategory);
  const [pendingProvince, setPendingProvince] = useState<string | null>(appliedProvince);
  const [provinceSearch, setProvinceSearch] = useState<string>("");

  // Update pending state when applied props change (e.g. via URL navigation)
  React.useEffect(() => {
    setPendingCategory(appliedCategory);
    setPendingProvince(appliedProvince);
  }, [appliedCategory, appliedProvince]);

  const filteredProvinces = provinces.filter(p => 
    p.title.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  const isDirty = pendingCategory !== appliedCategory || pendingProvince !== appliedProvince;

  return (
    <div className={cn(
      "h-full bg-white dark:bg-surface-a0 border-r border-slate-200 dark:border-surface-a10 flex flex-col relative shadow-2xl w-full transition-all duration-500 ease-in-out",
      !isOpen && "opacity-0 invisible pointer-events-none"
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/20 dark:border-surface-a20 bg-slate-50/50 dark:bg-surface-a0">
        <div className="flex items-center justify-between">
          <div className="flex items-center h-8 gap-2 text-slate-900 dark:text-white">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight whitespace-nowrap">Filter Quest</span>
          </div>
          <button onClick={onToggle} className="p-2 hover:bg-slate-100 dark:hover:bg-surface-a10 rounded-full text-slate-400 dark:text-slate-500 shrink-0">
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Categories Section */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex items-center gap-2">
              <Search className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categories</span>
            </div>
            {pendingCategory && (
              <button 
                onClick={() => setPendingCategory(null)}
                className="text-[9px] font-bold text-purple-500 hover:text-purple-600 border-b border-purple-500/20"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.title}
                onClick={() => setPendingCategory(category.title === pendingCategory ? null : category.title)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group",
                  pendingCategory === category.title
                    ? "bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 shadow-sm"
                    : "hover:bg-slate-50 dark:hover:bg-surface-a10 border border-transparent"
                )}
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-all">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center text-white transition-opacity duration-300",
                    pendingCategory === category.title ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    {category.icon}
                  </div>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className={cn(
                    "block text-xs font-bold truncate transition-colors",
                    pendingCategory === category.title ? "text-purple-700 dark:text-purple-400" : "text-slate-700 dark:text-slate-300"
                  )}>
                    {category.title}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-surface-a10 mx-6 my-1" />

        {/* Provinces Section */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex items-center gap-2">
              <Map className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Regions</span>
            </div>
            {pendingProvince && (
               <button 
                 onClick={() => setPendingProvince(null)}
                 className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 border-b border-indigo-500/20"
               >
                 Clear
               </button>
            )}
          </div>

          {/* Region Search */}
          <div className="relative px-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search provinces..."
              value={provinceSearch}
              onChange={(e) => setProvinceSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-surface-a10 border border-slate-100 dark:border-surface-a20 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-600 dark:text-slate-300"
            />
          </div>

          {/* Scrollable Regions List */}
          <div className="max-h-[190px] overflow-y-auto px-1 space-y-1 custom-scrollbar transition-all duration-300">
            {filteredProvinces.map((province) => (
              <button
                key={province.title}
                onClick={() => setPendingProvince(province.title === pendingProvince ? null : province.title)}
                className={cn(
                  "w-full flex items-center gap-3 p-1.5 rounded-xl transition-all duration-300 group",
                  pendingProvince === province.title
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 shadow-sm"
                    : "hover:bg-slate-50 dark:hover:bg-surface-a10 border border-transparent"
                )}
              >
                <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-sm group-hover:shadow-md transition-all">
                  <img
                    src={province.image}
                    alt={province.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center text-[10px] text-white transition-opacity duration-300",
                    pendingProvince === province.title ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    {province.icon}
                  </div>
                </div>
                <div className="text-left flex-1 min-w-0">
                  <span className={cn(
                    "block text-xs font-bold truncate transition-colors",
                    pendingProvince === province.title ? "text-indigo-700 dark:text-indigo-400" : "text-slate-700 dark:text-slate-300"
                  )}>
                    {province.title}
                  </span>
                </div>
              </button>
            ))}
            {filteredProvinces.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-[10px] text-slate-400 font-medium italic">No matches found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Apply Button */}
      <div className="p-4 border-t border-slate-100 dark:border-surface-a10 bg-white dark:bg-surface-a0">
        <button
          onClick={() => onApply(pendingCategory, pendingProvince)}
          disabled={!isDirty}
          className={cn(
            "w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 transform active:scale-[0.98]",
            isDirty 
              ? "gradient-bg text-white shadow-lg shadow-purple-500/20 hover:-translate-y-0.5" 
              : "bg-slate-100 dark:bg-surface-a10 text-slate-400 dark:text-slate-500 cursor-not-allowed"
          )}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};


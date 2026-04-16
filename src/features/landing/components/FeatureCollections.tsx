import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mountain, Sun, Palmtree, Building2, Ticket, ChevronRight } from 'lucide-react';

const collections = [
  {
    title: "Adventure",
    description: "Rugged trails and wild encounters in the Rockies.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
    icon: <Mountain className="w-5 h-5" />,
    color: "bg-orange-500",
    hoverShadow: "hover:shadow-orange-500/20"
  },
  {
    title: "Summer Bliss",
    description: "Lakeside retreats and endless golden hours.",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800",
    icon: <Sun className="w-5 h-5" />,
    color: "bg-yellow-500",
    hoverShadow: "hover:shadow-yellow-500/20"
  },
  {
    title: "Coastal Escape",
    description: "Serene beaches from Tofino to PEI.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    icon: <Palmtree className="w-5 h-5" />,
    color: "bg-blue-500",
    hoverShadow: "hover:shadow-blue-500/20"
  },
  {
    title: "Urban Pulse",
    description: "Culture, cuisine, and city lights in Toronto & Montreal.",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=800",
    icon: <Building2 className="w-5 h-5" />,
    color: "bg-purple-500",
    hoverShadow: "hover:shadow-purple-500/20"
  },
  {
    title: "Themed Journeys",
    description: "Northern Lights, Wine Tours, and Historical Paths.",
    image: "https://images.unsplash.com/photo-1531366929765-9e23ba0d3e5b?auto=format&fit=crop&q=80&w=800",
    icon: <Ticket className="w-5 h-5" />,
    color: "bg-emerald-500",
    hoverShadow: "hover:shadow-emerald-500/20"
  }
];

const FeatureCollections: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              <span className="text-gradient-chaos">Curated</span> Collections
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl">
              Explore hand-picked categories designed to match your specific travel style and seasonal preferences.
            </p>
          </div>
          <Link
            to="/explore"
            className="flex items-center gap-2 text-primary font-semibold group transition-all"
          >
            View all categories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {collections.map((item, i) => (
            <Link
              key={item.title}
              to={`/explore?category=${encodeURIComponent(item.title)}`}
              className="group cursor-pointer block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8 }}
              >
                <div className={`relative aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 shadow-lg transition-all duration-500 ${item.hoverShadow} hover:shadow-2xl`}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  {/* Bottom content */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className={`w-10 h-10 ${item.color} rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg ring-2 ring-white/20`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{item.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 px-2">
                  {item.description}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCollections;

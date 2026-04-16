
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import CanadaMap from './CanadaMap';

const featuredProvinces = [
  {
    name: "British Columbia",
    tagline: "Mountains & Ocean",
    description: "From the peaks of Whistler to the rugged shores of Vancouver Island.",
    image: "https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&q=80&w=1200",
    stats: "150+ Routes"
  },
  {
    name: "Alberta",
    tagline: "The Wild West",
    description: "Turquoise lakes, ancient glaciers, and the legendary Calgary Stampede.",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&q=80&w=1200",
    stats: "85+ Routes"
  },
  {
    name: "Ontario",
    tagline: "Heart of Canada",
    description: "Vibrant metropolises, the thunder of Niagara, and serene cottage country.",
    image: "https://images.unsplash.com/photo-1490623970972-ae8bb3da443e?auto=format&fit=crop&q=80&w=1200",
    stats: "210+ Routes"
  },
  {
    name: "Quebec",
    tagline: "La Belle Province",
    description: "European charm, cobblestone streets, and the majestic Laurentian mountains.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=1200",
    stats: "120+ Routes"
  }
];

const ProvinceDiscovery: React.FC = () => {
  return (
    <section className="py-24 px-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Discover by <span className="text-gradient-chaos">Province</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Deep dive into Canada's diverse landscapes. Each province offers a unique tapestry of experiences.
          </p>
        </div>

        {/* Featured Provinces */}
        <div className="space-y-8 mb-24">
          {featuredProvinces.map((province, i) => (
            <motion.div
              key={province.name}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-500 group`}
            >
              {/* Image */}
              <div className="lg:w-1/2 relative overflow-hidden h-64 lg:h-auto">
                <img
                  src={province.image}
                  alt={province.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                {/* Brand-tinted gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(to top, rgba(139,92,246,0.3) 0%, transparent 60%)' }} />
                <div className="absolute top-6 left-6">
                  <span className="px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-md ring-1 ring-black/5">
                    {province.stats}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-widest">{province.tagline}</span>
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{province.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                  {province.description}
                </p>
                <div>
                  <Link
                    to={`/explore?province=${encodeURIComponent(province.name)}`}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-2xl font-semibold transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 active:scale-95 group/btn"
                    style={{ background: 'linear-gradient(135deg, #da09de 0%, #8b5cf6 100%)' }}
                  >
                    Explore Routes
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Interactive Map */}
        <div className="pt-16 border-t border-slate-200 dark:border-slate-800">
          <CanadaMap />
        </div>
      </div>
    </section>
  );
};

export default ProvinceDiscovery;

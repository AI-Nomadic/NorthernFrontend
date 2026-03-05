
import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Simplified Canada GeoJSON URL
const geoUrl = "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/canada.geojson";

interface ProvinceData {
  name: string;
  id: string;
}

const CanadaMap: React.FC = () => {
  const [hoveredProvince, setHoveredProvince] = useState<ProvinceData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    setTooltipPos({ x: event.clientX, y: event.clientY });
  };

  const handleProvinceClick = (id: string) => {
    // Navigate to search page (simulated)
    window.location.href = `/explore?region=${id}`;
  };

  return (
    <div className="relative w-full bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-8 transition-colors duration-300" onMouseMove={handleMouseMove}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Interactive Regional Explorer</h3>
        <p className="text-slate-500 dark:text-slate-400">Hover over a province to discover popular itineraries.</p>
      </div>

      <div className="relative aspect-[4/3] w-full max-w-4xl mx-auto">
        <ComposableMap
          projection="geoAzimuthalEqualArea"
          projectionConfig={{
            rotate: [96, -60, 0],
            scale: 600
          }}
          className="w-full h-full"
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const provinceName = geo.properties.name;
                const provinceId = geo.id || geo.properties.postal || provinceName;
                const isHovered = hoveredProvince?.name === provinceName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      setHoveredProvince({ name: provinceName, id: provinceId });
                    }}
                    onMouseLeave={() => {
                      setHoveredProvince(null);
                    }}
                    onClick={() => handleProvinceClick(provinceId)}
                    style={{
                      default: {
                        fill: "var(--map-fill, #F1F5F9)",
                        stroke: "var(--map-stroke, #CBD5E1)",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "all 250ms"
                      },
                      hover: {
                        fill: "var(--clr-primary-a0)",
                        stroke: "var(--clr-primary-a10)",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: "pointer"
                      },
                      pressed: {
                        fill: "var(--clr-primary-a10)",
                        outline: "none"
                      }
                    }}
                    aria-label={provinceName}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Floating Tooltip/CTA */}
        <AnimatePresence>
          {hoveredProvince && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              style={{
                position: 'fixed',
                left: tooltipPos.x + 20,
                top: tooltipPos.y - 40,
                pointerEvents: 'none',
                zIndex: 100
              }}
              className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 min-w-[200px]"
            >
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Discover</p>
              <h4 className="text-lg font-bold mb-3">{hoveredProvince.name}</h4>
              <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
                Explore Popular Itineraries
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-100 dark:bg-slate-800 rounded-sm border border-slate-200 dark:border-slate-700" />
          <span>Available Regions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-sm" />
          <span>Active Selection</span>
        </div>
      </div>
    </div>
  );
};

export default CanadaMap;

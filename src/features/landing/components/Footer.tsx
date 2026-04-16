
import React from 'react';
import { Plane, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0f1e] text-slate-400 py-20 px-6 border-t border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/30"
                style={{ background: 'linear-gradient(135deg, #da09de 0%, #8b5cf6 100%)' }}
              >
                <Plane className="text-white w-4 h-4 rotate-45" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Northern Path <span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-8">
              The world's first AI architect specializing in Canadian logistics. Built for travelers who value time as much as experiences.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                <Icon
                  key={i}
                  className="w-5 h-5 hover:text-primary cursor-pointer transition-all duration-200 hover:scale-110"
                />
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-extrabold mb-6 tracking-tight">Product</h4>
            <ul className="space-y-4 text-sm">
              {['Features', 'Integrations', 'Pricing', 'Enterprise'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors duration-200">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-white font-extrabold mb-6 tracking-tight">Destinations</h4>
            <ul className="space-y-4 text-sm">
              {['Western Canada', 'Eastern Canada', 'The Arctic', 'Maritimes'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors duration-200">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-extrabold mb-6 tracking-tight">Company</h4>
            <ul className="space-y-4 text-sm">
              {['About Us', 'Careers', 'Blog', 'Contact'].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors duration-200">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium tracking-wider uppercase">
          <p>© 2025 Northern Path AI. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Built with <span className="text-primary font-bold">Gemini AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

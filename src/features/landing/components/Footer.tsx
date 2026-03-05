
import React from 'react';
import { Plane, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0a0f1e] text-slate-400 py-20 px-6 border-t border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Plane className="text-white w-5 h-5 rotate-45" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">Northern Path <span className="text-blue-500">AI</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-8">
              The world's first AI architect specializing in Canadian logistics. Built for travelers who value time as much as experiences.
            </p>
            <div className="flex items-center gap-4">
              <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              <Github className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
              <Mail className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Destinations</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Western Canada</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Eastern Canada</a></li>
              <li><a href="#" className="hover:text-white transition-colors">The Arctic</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Maritimes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium tracking-wider uppercase">
          <p>© 2025 Northern Path AI. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Built with <span className="text-blue-500 font-bold">Gemini AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

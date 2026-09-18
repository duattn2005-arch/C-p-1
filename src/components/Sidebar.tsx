import React from 'react';
import { ViewMode } from '../types';
import { 
  Home, 
  BookOpen, 
  Target, 
  Bot, 
  Award, 
  Gift, 
  Rocket, 
  Sparkles 
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  className = '',
}) => {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Trang chủ', icon: <Home className="w-5 h-5" /> },
    { id: 'curriculum', label: 'Học tập', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'practice', label: 'Luyện tập', icon: <Target className="w-5 h-5" /> },
    { id: 'ai-tutor', label: 'AI Tutor', icon: <Bot className="w-5 h-5" /> },
    { id: 'achievements', label: 'Thành tích', icon: <Award className="w-5 h-5" /> },
    { id: 'rewards', label: 'Phần thưởng', icon: <Gift className="w-5 h-5" /> },
  ];

  return (
    <aside
      className={`w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-5 select-none shrink-0 shadow-[4px_0_24px_rgba(36,50,74,0.02)] ${className}`}
    >
      <div className="flex flex-col gap-7">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectView('dashboard')}
          className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5BA7FF] via-[#7C65F8] to-[#A99CFB] flex items-center justify-center text-white shadow-md shadow-[#5BA7FF]/20 text-2xl font-black group-hover:scale-105 transition-transform">
            🤖
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-[22px] tracking-tight text-[#24324A] flex items-center gap-1">
              KIDDO<span className="text-[#5BA7FF]">.AI</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            </span>
            <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mt-0.5">
              Học tập thông minh
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-extrabold text-[15px] transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#EAF2FF] text-[#2563EB] shadow-xs'
                    : 'text-slate-500 hover:text-[#24324A] hover:bg-slate-50'
                }`}
              >
                <span className={isActive ? 'text-[#2563EB]' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.id === 'ai-tutor' && (
                  <span className="ml-auto text-[10px] font-black bg-[#A99CFB]/20 text-[#5E51AA] px-2 py-0.5 rounded-full">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cheerful Encouragement Widget at Bottom */}
      <div className="bg-gradient-to-br from-[#EFF6FF] via-[#F4F8FF] to-[#F5F3FF] p-4 rounded-2xl flex items-center gap-3 border border-blue-100/70 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-white shadow-xs flex items-center justify-center text-xl shrink-0 text-blue-500">
          <Rocket className="w-5 h-5 text-[#5BA7FF]" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-[14px] text-[#1D4ED8]">
            Cố lên nhé Minh!
          </span>
          <span className="text-[11px] font-bold text-slate-500 leading-snug">
            Hôm nay học rất cừ! Tiếp tục nhé 🚀
          </span>
        </div>
      </div>
    </aside>
  );
};

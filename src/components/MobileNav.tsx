import React from 'react';
import { ViewMode } from '../types';
import { 
  Home, 
  BookOpen, 
  Target, 
  Bot, 
  Award, 
  Gift 
} from 'lucide-react';

interface MobileNavProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onSelectView,
}) => {
  const items: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
    { id: 'dashboard', icon: <Home className="w-5 h-5" />, label: 'Trang chủ' },
    { id: 'curriculum', icon: <BookOpen className="w-5 h-5" />, label: 'Học tập' },
    { id: 'practice', icon: <Target className="w-5 h-5" />, label: 'Luyện tập' },
    { id: 'ai-tutor', icon: <Bot className="w-5 h-5" />, label: 'AI Tutor' },
    { id: 'achievements', icon: <Award className="w-5 h-5" />, label: 'Thành tích' },
    { id: 'rewards', icon: <Gift className="w-5 h-5" />, label: 'Phần thưởng' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-3 left-3 right-3 h-16 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_12px_32px_rgba(36,50,74,0.12)] border border-slate-100/90 z-50 flex items-center justify-around px-2">
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectView(item.id)}
            className={`flex flex-col items-center justify-center w-11 h-11 rounded-full transition-all cursor-pointer ${
              isActive
                ? 'text-[#2563EB] bg-blue-50 scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            title={item.label}
          >
            {item.icon}
          </button>
        );
      })}
    </nav>
  );
};

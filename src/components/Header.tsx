import React from 'react';
import { StudentProfile } from '../types';
import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  profile: StudentProfile;
  onOpenProfile?: () => void;
  onChangeGrade?: (grade: number) => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenProfile,
  onChangeGrade,
  title,
  subtitle,
}) => {
  const grades = [1, 2, 3, 4, 5];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_12px_rgba(36,50,74,0.03)] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* User Greeting / Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Logo Pill */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#5BA7FF] to-[#A99CFB] flex items-center justify-center text-white text-lg font-black shadow-sm">
              🤖
            </div>
            <span className="font-black text-lg tracking-tight text-[#24324A]">
              KIDDO<span className="text-[#5BA7FF]">.AI</span>
            </span>
          </div>

          <div className="hidden sm:flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-[#24324A]">
                {title || `Xin chào, ${profile.name}`}
              </h1>
              <span className="text-xl">👋</span>
            </div>
            <p className="text-xs font-bold text-slate-400">
              {subtitle || 'Cùng học tập vui vẻ và khám phá kiến thức mới nhé!'}
            </p>
          </div>
        </div>

        {/* Center: Grade Switcher for Primary School */}
        {onChangeGrade && (
          <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60 shadow-xs">
            <div className="hidden md:flex items-center gap-1.5 px-2 text-slate-500 font-extrabold text-xs">
              <GraduationCap className="w-4 h-4 text-[#3B82F6]" />
              <span>Khối lớp:</span>
            </div>
            {grades.map((g) => {
              const isActive = profile.grade === g;
              return (
                <button
                  key={g}
                  onClick={() => onChangeGrade(g)}
                  className={`px-2.5 sm:px-3 py-1 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#3B82F6] text-white shadow-xs scale-105'
                      : 'text-slate-600 hover:text-[#24324A] hover:bg-slate-200/60'
                  }`}
                  title={`Chuyển sang chương trình Lớp ${g}`}
                >
                  Lớp {g}
                </button>
              );
            })}
          </div>
        )}

        {/* Gamification Pills & Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Badge */}
          <div
            className="flex items-center gap-1.5 bg-[#FFF4ED] border border-orange-200/80 px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer"
            title="Chuỗi học tập liên tục!"
          >
            <span className="text-lg">🔥</span>
            <span className="font-extrabold text-sm text-orange-600">
              {profile.streakDays} ngày
            </span>
          </div>

          {/* XP Badge */}
          <div
            className="flex items-center gap-1.5 bg-[#FEF9E7] border border-amber-200/90 px-3 py-1.5 rounded-full shadow-sm hover:scale-105 transition-transform cursor-pointer"
            title="Điểm kinh nghiệm tích lũy"
          >
            <span className="text-lg">⭐</span>
            <span className="font-extrabold text-sm text-amber-600">
              {profile.xp.toLocaleString('vi-VN')} XP
            </span>
          </div>

          {/* Level Badge */}
          <div className="hidden md:flex items-center gap-2 bg-[#F0F5FF] border border-blue-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
            <span className="text-lg">🎖️</span>
            <div className="flex flex-col">
              <span className="font-extrabold text-xs text-[#1D4ED8] leading-tight">
                Level {profile.level}
              </span>
              <div className="w-12 h-1.5 bg-blue-100 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-[#5BA7FF] rounded-full"
                  style={{ width: `${profile.levelProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Student Avatar */}
          <button
            onClick={onOpenProfile}
            className="relative pl-1 focus:outline-none focus:ring-2 focus:ring-[#5BA7FF] rounded-full group cursor-pointer"
            title="Hồ sơ của Minh"
          >
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#5BA7FF]/30 group-hover:ring-[#5BA7FF] transition-all shadow-sm bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-xl">
              👦
            </div>
            <span className="absolute -bottom-1 -right-1 bg-[#5BA7FF] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {profile.level}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { GradeLevel } from '../types/curriculum';
import { KiddoMascot } from './KiddoMascot';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onSelectGrade: (grade: GradeLevel) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onSelectGrade,
}) => {
  if (!isOpen) return null;

  const grades: {
    grade: GradeLevel;
    title: string;
    subtitle: string;
    icon: string;
    color: string;
    bgHover: string;
  }[] = [
    {
      grade: 1,
      title: 'Lớp 1',
      subtitle: 'Khám phá chữ cái, đếm số & hình khối vui nhộn',
      icon: '🎒',
      color: '#5BA7FF',
      bgHover: 'hover:border-blue-300 hover:bg-blue-50/50',
    },
    {
      grade: 2,
      title: 'Lớp 2',
      subtitle: 'Phép cộng trừ có nhớ (52 − 27), từ chỉ sự vật & tiếng Anh',
      icon: '🚀',
      color: '#68D5B5',
      bgHover: 'hover:border-emerald-300 hover:bg-emerald-50/50',
    },
    {
      grade: 3,
      title: 'Lớp 3',
      subtitle: 'Bảng nhân 7, chu vi diện tích & văn học sinh động',
      icon: '⭐',
      color: '#FFD65A',
      bgHover: 'hover:border-amber-300 hover:bg-amber-50/50',
    },
    {
      grade: 4,
      title: 'Lớp 4',
      subtitle: 'Chia số lớn, phân số, hình bình hành & bài toán tổng - tỉ',
      icon: '🏆',
      color: '#A99CFB',
      bgHover: 'hover:border-purple-300 hover:bg-purple-50/50',
    },
    {
      grade: 5,
      title: 'Lớp 5',
      subtitle: 'Số thập phân, toán chuyển động đều (v = s : t) & bứt phá',
      icon: '🌟',
      color: '#FF785A',
      bgHover: 'hover:border-rose-300 hover:bg-rose-50/50',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-purple-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* Header Mascot and Greeting */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left relative z-10">
          <div className="shrink-0">
            <KiddoMascot mood="cheer" size="md" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] font-black text-xs mb-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-blue-400 text-blue-500" />
              <span>Chào mừng con đến với KIDDO.AI</span>
            </div>
            <h2 className="font-black text-2xl sm:text-3xl text-[#24324A] tracking-tight">
              Con đang học lớp mấy? 🎓
            </h2>
            <p className="text-sm font-bold text-slate-500 mt-1">
              Chọn đúng khối lớp để Kiddo AI chuẩn bị bài học và câu đố phù hợp nhất cho con nhé!
            </p>
          </div>
        </div>

        {/* 5 Grade Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
          {grades.map((item) => (
            <button
              key={item.grade}
              onClick={() => onSelectGrade(item.grade)}
              className={`p-4 rounded-2xl border-2 border-slate-100 bg-white text-left transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between gap-3 group ${item.bgHover}`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-slate-50 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <span className="font-black text-base px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {item.title}
                </span>
              </div>
              <div>
                <h4 className="font-black text-base text-[#24324A]">
                  Chương trình {item.title}
                </h4>
                <p className="text-xs font-bold text-slate-400 mt-1 leading-relaxed line-clamp-2">
                  {item.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-black text-[#3B82F6] pt-1">
                <span>Chọn lớp này</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <div className="text-center text-xs font-bold text-slate-400">
          💡 Đừng lo, con có thể thay đổi khối lớp bất cứ lúc nào ở thanh menu phía trên!
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { StudentProfile } from '../types';
import { 
  Trophy, 
  Flame, 
  Award, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Medal 
} from 'lucide-react';

interface AchievementsViewProps {
  profile: StudentProfile;
  onOpenLesson: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  profile,
  onOpenLesson,
}) => {
  const badges = [
    {
      id: 'b-1',
      title: 'Nhà Toán Học Nhí',
      desc: 'Đạt 1.400 XP môn Toán',
      progress: '1.250 / 1.400 XP',
      icon: '🏅',
      unlocked: false,
    },
    {
      id: 'b-2',
      title: 'Bậc Thầy Chăm Chỉ',
      desc: 'Duy trì chuỗi học tập 5 ngày liên tiếp',
      progress: '5 / 5 ngày',
      icon: '🔥',
      unlocked: true,
    },
    {
      id: 'b-3',
      title: 'Tay Săn Điểm 10',
      desc: 'Trả lời đúng liên tục 10 câu hỏi không sai',
      progress: '10 / 10 câu',
      icon: '⭐',
      unlocked: true,
    },
    {
      id: 'b-4',
      title: 'Cây Bút Trẻ Tài Ba',
      desc: 'Hoàn thành 10 bài luyện từ và câu Tiếng Việt',
      progress: '9 / 10 bài',
      icon: '🖋️',
      unlocked: false,
    },
    {
      id: 'b-5',
      title: 'Nhà Thám Hiểm Ngôn Ngữ',
      desc: 'Học thuộc 50 từ vựng tiếng Anh',
      progress: '42 / 50 từ',
      icon: '🌍',
      unlocked: false,
    },
    {
      id: 'b-6',
      title: 'Bạn Thân Của Kiddo AI',
      desc: 'Hỏi và nghe AI Tutor giải thích 5 lần',
      progress: '5 / 5 lần',
      icon: '🤖',
      unlocked: true,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-7 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-[#FFF9EB] via-[#FFF3D6] to-[#FFE8B3] rounded-3xl p-6 sm:p-8 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center text-4xl shrink-0">
            🏆
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800">
              Bảng Vàng Danh Dự
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
              Thành tích học tập của {profile.name}
            </h2>
            <p className="text-sm font-bold text-amber-900/80 mt-1">
              Đã thu thập 3/6 huy hiệu danh giá • Level {profile.level}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-2xl border border-amber-200 shadow-xs">
          <div className="flex flex-col text-center">
            <span className="text-xs font-bold text-slate-400">Tổng XP</span>
            <span className="text-2xl font-black text-amber-600">
              {profile.xp.toLocaleString('vi-VN')}
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col text-center">
            <span className="text-xs font-bold text-slate-400">Chuỗi ngày</span>
            <span className="text-2xl font-black text-orange-600">
              {profile.streakDays} ngày
            </span>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
              b.unlocked
                ? 'bg-white border-amber-200 shadow-sm'
                : 'bg-white/70 border-slate-200/70 opacity-80'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0 ${
                  b.unlocked ? 'bg-amber-100' : 'bg-slate-100 grayscale'
                }`}
              >
                {b.icon}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-base text-[#24324A]">{b.title}</h3>
                  {b.unlocked && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                  )}
                </div>
                <p className="text-xs font-bold text-slate-500 mt-1">{b.desc}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-black">
              <span className="text-slate-400">{b.progress}</span>
              <span className={b.unlocked ? 'text-emerald-600' : 'text-purple-600'}>
                {b.unlocked ? 'Đã mở khoá ✨' : 'Đang thực hiện'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { StudentProfile } from '../types';
import confetti from 'canvas-confetti';
import { 
  Gift, 
  Sparkles, 
  Check, 
  Lock, 
  Flame, 
  Coins 
} from 'lucide-react';

interface RewardsViewProps {
  profile: StudentProfile;
  onClaimChest: (xpAmount: number) => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  profile,
  onClaimChest,
}) => {
  const [chestOpened, setChestOpened] = useState(false);
  const [claimedReward, setClaimedReward] = useState<string | null>(null);

  const handleOpenChest = () => {
    if (chestOpened) return;
    setChestOpened(true);
    setClaimedReward('+80 XP & Huy Hiệu Siêu Sao Môn Toán! 🌟');
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#FFD65A', '#FF8A7A', '#68D5B5', '#5BA7FF'],
      });
    } catch (e) {}
    onClaimChest(80);
  };

  const rewardsShop = [
    {
      id: 'r-1',
      title: 'Mũ Phù Thuỷ AI',
      category: 'Phụ kiện Avatar',
      cost: 300,
      icon: '🧙‍♂️',
      owned: true,
    },
    {
      id: 'r-2',
      title: 'Kính Thiên Văn Vũ Trụ',
      category: 'Phụ kiện Avatar',
      cost: 500,
      icon: '🔭',
      owned: false,
    },
    {
      id: 'r-3',
      title: 'Khung Avatar Cầu Vồng',
      category: 'Khung viền',
      cost: 400,
      icon: '🌈',
      owned: true,
    },
    {
      id: 'r-4',
      title: 'Bộ Sticker Bạn Bè Kiddo',
      category: 'Gói cảm xúc',
      cost: 250,
      icon: '✨',
      owned: false,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-7 pb-16">
      {/* Treasure Chest Spotlight */}
      <div className="bg-gradient-to-br from-[#FFF9EB] via-[#FFF3D6] to-[#FFE8B3] rounded-3xl p-6 sm:p-10 border border-amber-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-8 text-center sm:text-left">
        <div className="flex flex-col gap-3 max-w-lg">
          <div className="inline-flex items-center gap-2 self-center sm:self-start px-3.5 py-1 rounded-full bg-white/90 text-amber-900 font-extrabold text-xs shadow-xs">
            <Gift className="w-4 h-4 text-amber-600" />
            <span>Rương Kho Báu Hàng Tuần</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-amber-950">
            Mở rương bí mật nhận quà cực lớn!
          </h2>
          <p className="text-sm font-bold text-amber-900/80 leading-relaxed">
            Con đã học liên tục 5 ngày trong tuần! Hãy chạm vào chiếc rương ma thuật để nhận quà tặng bất ngờ từ Kiddo AI nhé!
          </p>

          {claimedReward && (
            <div className="p-3 bg-white/95 rounded-2xl border border-amber-200 text-amber-900 font-black text-sm shadow-xs animate-fadeIn">
              🎉 {claimedReward}
            </div>
          )}
        </div>

        {/* Big Chest Animation */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleOpenChest}
            disabled={chestOpened}
            className={`w-36 h-36 rounded-3xl flex items-center justify-center text-7xl shadow-lg transition-transform cursor-pointer ${
              chestOpened
                ? 'bg-amber-200/90 scale-95'
                : 'bg-white hover:scale-105 active:scale-95 animate-bounce'
            }`}
          >
            {chestOpened ? '✨🎁✨' : '🎁'}
          </button>
          <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
            {chestOpened ? 'Đã nhận quà tuần!' : 'Chạm để mở quà!'}
          </span>
        </div>
      </div>

      {/* Reward Shop / Collectibles */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-black text-xl text-[#24324A]">Đổi quà bằng điểm XP</h3>
          </div>
          <span className="text-xs font-black text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
            Kho đồ của Minh
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rewardsShop.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-col items-center text-center justify-between gap-4"
            >
              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl shadow-inner">
                {item.icon}
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400">
                  {item.category}
                </span>
                <h4 className="font-black text-base text-[#24324A]">{item.title}</h4>
              </div>

              {item.owned ? (
                <div className="w-full py-2 rounded-full bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" />
                  <span>Đã sở hữu</span>
                </div>
              ) : (
                <button className="w-full py-2 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-xs btn-tactile-blue transition-all flex items-center justify-center gap-1 cursor-pointer">
                  <span>{item.cost} XP</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

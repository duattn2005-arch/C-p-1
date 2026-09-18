import React from 'react';
import { GradeLevel } from '../types/curriculum';
import { KiddoMascot } from './KiddoMascot';
import { AlertCircle } from 'lucide-react';

interface GradeConfirmModalProps {
  isOpen: boolean;
  currentGrade: number;
  targetGrade: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const GradeConfirmModal: React.FC<GradeConfirmModalProps> = ({
  isOpen,
  currentGrade,
  targetGrade,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col gap-5 text-center relative">
        <div className="mx-auto">
          <KiddoMascot mood="thinking" size="md" />
        </div>

        <div>
          <h3 className="font-black text-xl text-[#24324A]">
            Chuyển sang chương trình Lớp {targetGrade}?
          </h3>
          <p className="text-sm font-bold text-slate-500 mt-2 leading-relaxed">
            Nội dung bài học, bài luyện tập và câu hỏi của Toán, Tiếng Việt, Tiếng Anh sẽ được đổi sang chuẩn kiến thức <span className="text-[#2563EB] font-black">Lớp {targetGrade}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-full font-black text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Giữ Lớp {currentGrade}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-full font-black text-sm text-white bg-[#3B82F6] hover:bg-blue-700 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
          >
            Đồng ý chuyển ✨
          </button>
        </div>
      </div>
    </div>
  );
};

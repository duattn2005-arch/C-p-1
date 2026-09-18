import React, { useState } from 'react';
import { GradeLevel, SubjectId, DifficultyLevel, CurriculumQuestion } from '../types/curriculum';
import { questionBank, topicsDatabase, skillsDatabase } from '../data/curriculumData';
import { storageService } from '../services/storage';
import { 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Filter, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Bot, 
  BookOpen, 
  RefreshCw,
  Search,
  Eye
} from 'lucide-react';

interface AdminViewProps {
  onBackToDashboard: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBackToDashboard }) => {
  const [selectedGrade, setSelectedGrade] = useState<number>(3);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [aiPreviewQuestions, setAiPreviewQuestions] = useState<any[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [genSubject, setGenSubject] = useState<SubjectId>('math');
  const [genTopic, setGenTopic] = useState<string>('Phép trừ trong phạm vi 100');
  const [genSkill, setGenSkill] = useState<string>('Phép trừ có nhớ (52 - 27)');
  const [genCount, setGenCount] = useState<number>(3);
  const [genDiff, setGenDiff] = useState<number>(2);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Combine static bank with published AI questions
  const publishedAiQuestions = storageService.getAiGeneratedQuestions();
  const allQuestions = [...publishedAiQuestions, ...questionBank];

  // Filtering
  const filteredQuestions = allQuestions.filter((q) => {
    if (selectedGrade !== 0 && q.grade !== selectedGrade) return false;
    if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;
    if (selectedDifficulty !== 'all' && q.difficulty !== Number(selectedDifficulty)) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchText = `${q.question_content} ${q.formula || ''} ${q.explanation}`.toLowerCase();
      if (!matchText.includes(term)) return false;
    }
    return true;
  });

  // Request AI Generation via server endpoint
  const handleGenerateAiQuestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          subject: genSubject,
          topic: genTopic,
          skill: genSkill,
          difficulty: genDiff,
          count: genCount,
        }),
      });

      if (!response.ok) throw new Error('AI Server error');

      const data = await response.json();
      if (data && Array.isArray(data.questions)) {
        setAiPreviewQuestions(data.questions);
        showNotification(`Đã tạo thành công ${data.questions.length} câu hỏi mới bằng AI! 🤖`);
      }
    } catch (e: any) {
      showNotification('Không thể kết nối AI, vui lòng kiểm tra server!');
    } finally {
      setIsGenerating(false);
    }
  };

  // Publish AI Question into live bank
  const handlePublishAiQuestion = (aiQ: any, index: number) => {
    const publishedQ: CurriculumQuestion = {
      id: `ai-${Date.now()}-${index}`,
      grade: (selectedGrade as GradeLevel),
      subject: genSubject,
      topic: genTopic,
      skill: genSkill,
      difficulty: (aiQ.difficulty || genDiff) as any,
      question_type: 'multiple_choice',
      question_content: aiQ.question,
      formula: aiQ.question.includes('=') ? aiQ.question : undefined,
      choices: aiQ.choices,
      correct_answer: aiQ.correctAnswer,
      explanation: aiQ.explanation || 'Giải thích phương pháp giải chuẩn.',
      hint: aiQ.hint || 'Quan sát kỹ bài toán nhé con!',
      source_type: 'ai_generated',
      ai_generated: true,
      validation_status: 'approved',
    };

    storageService.saveAiGeneratedQuestion(publishedQ);
    // Remove from preview list
    setAiPreviewQuestions((prev) => prev.filter((_, idx) => idx !== index));
    showNotification('Đã duyệt và xuất bản câu hỏi vào Ngân hàng! 🌟');
  };

  // Reject AI Question
  const handleRejectAiQuestion = (index: number) => {
    setAiPreviewQuestions((prev) => prev.filter((_, idx) => idx !== index));
    showNotification('Đã từ chối câu hỏi AI.');
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-20">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-[#24324A] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn border border-slate-700">
          <span>✨</span>
          <span className="font-bold text-sm">{notification}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center text-2xl shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-2xl text-[#24324A]">
                Quản trị Nội dung & Ngân hàng Câu hỏi
              </h1>
              <span className="text-xs font-black bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Kiddo Admin CMS
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-0.5">
              Quản lý cây kiến thức Grade 1–5, tạo câu hỏi tự động với Gemini AI và kiểm duyệt
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm transition-all shadow-md shadow-purple-500/20 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Yêu cầu AI tạo câu hỏi</span>
          </button>

          <button
            onClick={onBackToDashboard}
            className="px-4 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm transition-colors cursor-pointer"
          >
            Về Dashboard
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Grade Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            {[1, 2, 3, 4, 5].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                  selectedGrade === g
                    ? 'bg-[#3B82F6] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-black px-3.5 py-2 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="all">Tất cả môn</option>
            <option value="math">Toán học</option>
            <option value="vietnamese">Tiếng Việt</option>
            <option value="english">Tiếng Anh</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-black px-3.5 py-2 rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="all">Mọi độ khó</option>
            <option value="1">Độ khó 1 (Rất dễ)</option>
            <option value="2">Độ khó 2 (Dễ)</option>
            <option value="3">Độ khó 3 (Trung bình)</option>
            <option value="4">Độ khó 4 (Khó)</option>
            <option value="5">Độ khó 5 (Nâng cao)</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm nội dung câu hỏi..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {/* AI Generator Preview Box (if any pending) */}
      {aiPreviewQuestions.length > 0 && (
        <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-2 border-purple-200 p-6 rounded-3xl flex flex-col gap-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-lg text-purple-950">
                Câu hỏi AI vừa tạo ({aiPreviewQuestions.length} câu đang chờ duyệt)
              </h3>
            </div>
            <span className="text-xs font-extrabold text-purple-700 bg-white px-3 py-1 rounded-full border border-purple-200">
              Đã qua kiểm định toán học tự động (Deterministic Verification)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiPreviewQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                      Câu {idx + 1}
                    </span>
                    <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      Cấp {q.difficulty || genDiff}
                    </span>
                  </div>

                  <p className="font-black text-sm text-[#24324A] line-clamp-3">
                    {q.question}
                  </p>

                  <div className="flex flex-col gap-1 text-xs font-bold text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                    <span className="text-emerald-600 font-black">
                      Đáp án đúng: {q.correctAnswer}
                    </span>
                    <span className="text-slate-400 line-clamp-2">
                      Giải thích: {q.explanation}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handlePublishAiQuestion(q, idx)}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Duyệt & Xuất bản</span>
                  </button>
                  <button
                    onClick={() => handleRejectAiQuestion(idx)}
                    className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-black text-xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Questions List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#3B82F6]" />
            <h3 className="font-black text-lg text-[#24324A]">
              Ngân hàng Câu hỏi ({filteredQuestions.length} câu)
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400">
            Hiển thị chuẩn hoá theo cấu trúc cây tri thức
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-2xl border border-slate-100 hover:border-blue-200 bg-white hover:bg-blue-50/10 transition-all flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    Lớp {q.grade} • {q.subject === 'math' ? 'Toán' : q.subject === 'vietnamese' ? 'Tiếng Việt' : 'Tiếng Anh'}
                  </span>
                  <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Cấp {q.difficulty}
                  </span>
                </div>

                <p className="font-black text-sm text-[#24324A] line-clamp-2">
                  {q.question_content}
                </p>
                {q.formula && (
                  <div className="font-black text-lg text-blue-700 bg-slate-50 p-2 rounded-xl text-center">
                    {q.formula}
                  </div>
                )}

                <div className="text-xs font-bold text-slate-500">
                  <span className="font-black text-emerald-600">ĐA:</span> {q.correct_answer}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-400 pt-2 border-t border-slate-100">
                <span>Nguồn: {q.source_type === 'ai_generated' ? '🤖 AI tạo' : '📚 SGK chuẩn'}</span>
                <span className="text-emerald-600 font-black">✓ Đã duyệt</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Generation Modal Dialog */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-lg text-[#24324A]">
                  Yêu cầu Gemini AI tạo câu hỏi mới
                </h3>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-black text-sm flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-black text-slate-600 uppercase">Môn học:</label>
                <select
                  value={genSubject}
                  onChange={(e) => setGenSubject(e.target.value as SubjectId)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                >
                  <option value="math">Toán học</option>
                  <option value="vietnamese">Tiếng Việt</option>
                  <option value="english">Tiếng Anh</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-600 uppercase">Chủ đề (Topic):</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-600 uppercase">Kỹ năng cụ thể (Skill):</label>
                <input
                  type="text"
                  value={genSkill}
                  onChange={(e) => setGenSkill(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black text-slate-600 uppercase">Số lượng câu:</label>
                  <select
                    value={genCount}
                    onChange={(e) => setGenCount(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                  >
                    <option value={3}>3 câu</option>
                    <option value={5}>5 câu</option>
                    <option value={8}>8 câu</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-600 uppercase">Độ khó:</label>
                  <select
                    value={genDiff}
                    onChange={(e) => setGenDiff(Number(e.target.value))}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-sm font-bold"
                  >
                    <option value={1}>Cấp 1 (Rất dễ)</option>
                    <option value={2}>Cấp 2 (Dễ)</option>
                    <option value={3}>Cấp 3 (Trung bình)</option>
                    <option value={4}>Cấp 4 (Khó)</option>
                    <option value={5}>Cấp 5 (Nâng cao)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              disabled={isGenerating}
              onClick={async () => {
                await handleGenerateAiQuestions();
                setAiModalOpen(false);
              }}
              className="w-full py-3.5 rounded-full font-black text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-500/25"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini đang tạo câu hỏi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt đầu tạo bằng AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

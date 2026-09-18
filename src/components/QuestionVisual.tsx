import { Fragment, type ReactNode } from 'react';
import type { OptionFace, QuestionVisual, ShapeName } from '../types/curriculum';

// Pictures shown above a question (fruit to count, colour swatches, clocks, rulers...) and inside answer options.
// Young children learn from pictures, so grade 1 questions lean on these heavily.

const INK = '#1E3A8A';
const SHAPE_DEFAULT = '#5BA7FF';

export function ShapeSvg({ shape, hex, size = 120 }: { shape: ShapeName; hex?: string; size?: number }) {
  const fill = hex ?? SHAPE_DEFAULT;
  const common = { fill, stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={shape}>
      {shape === 'circle' && <circle cx="50" cy="50" r="42" {...common} />}
      {shape === 'square' && <rect x="12" y="12" width="76" height="76" {...common} />}
      {shape === 'rectangle' && <rect x="4" y="24" width="92" height="52" {...common} />}
      {shape === 'triangle' && <polygon points="50,8 94,90 6,90" {...common} />}
    </svg>
  );
}

function ObjectsView({ v }: { v: Extract<QuestionVisual, { kind: 'objects' }> }) {
  const total = v.groups.reduce((sum, g) => sum + g.count, 0);
  const size = total > 30 ? 'text-xl' : total > 16 ? 'text-2xl' : 'text-4xl';
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      {v.groups.map((g, gi) => (
        <Fragment key={gi}>
          {gi > 0 && v.op && (
            <span className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 font-black text-2xl flex items-center justify-center">{v.op}</span>
          )}
          <div className="flex flex-wrap items-center justify-center gap-1.5 px-3 py-2 rounded-2xl bg-white border-2 border-dashed border-sky-200 max-w-[22rem]">
            {Array.from({ length: g.count }, (_, k) => {
              const crossed = k >= g.count - (g.crossed ?? 0);
              return (
                <span key={k} className={`relative leading-none select-none ${size} ${crossed ? 'opacity-40 grayscale' : ''}`}>
                  {v.emoji}
                  {crossed && <span className="absolute inset-0 flex items-center justify-center text-rose-500 font-black text-3xl">✕</span>}
                </span>
              );
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function ClockView({ hour, minute }: { hour: number; minute: number }) {
  const minuteAngle = minute * 6;
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const hand = (angle: number, length: number, width: number, color: string) => (
    <line x1="100" y1="100" x2={100 + length * Math.sin((angle * Math.PI) / 180)} y2={100 - length * Math.cos((angle * Math.PI) / 180)} stroke={color} strokeWidth={width} strokeLinecap="round" />
  );
  return (
    <svg viewBox="0 0 200 200" width="190" height="190" role="img" aria-label={`Đồng hồ chỉ ${hour} giờ ${minute} phút`}>
      <circle cx="100" cy="100" r="92" fill="#FFFFFF" stroke={INK} strokeWidth="6" />
      {Array.from({ length: 60 }, (_, k) => {
        const a = (k * 6 * Math.PI) / 180;
        const long = k % 5 === 0;
        return <line key={k} x1={100 + (long ? 78 : 84) * Math.sin(a)} y1={100 - (long ? 78 : 84) * Math.cos(a)} x2={100 + 88 * Math.sin(a)} y2={100 - 88 * Math.cos(a)} stroke="#94A3B8" strokeWidth={long ? 3 : 1} />;
      })}
      {Array.from({ length: 12 }, (_, k) => {
        const n = k + 1;
        const a = (n * 30 * Math.PI) / 180;
        return <text key={n} x={100 + 64 * Math.sin(a)} y={100 - 64 * Math.cos(a) + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill={INK}>{n}</text>;
      })}
      {hand(hourAngle, 46, 8, INK)}
      {hand(minuteAngle, 68, 5, '#E86350')}
      <circle cx="100" cy="100" r="6" fill={INK} />
    </svg>
  );
}

function RulerView({ length, start = 0 }: { length: number; start?: number }) {
  const max = Math.max(10, start + length);
  const cell = 34;
  const x = (n: number) => 16 + n * cell;
  return (
    <svg viewBox={`0 0 ${x(max) + 16} 96`} className="w-full max-w-lg" role="img" aria-label={`Thước kẻ, đoạn thẳng từ ${start} đến ${start + length}`}>
      <line x1={x(start)} y1="20" x2={x(start + length)} y2="20" stroke="#F59E0B" strokeWidth="14" strokeLinecap="round" />
      <rect x="4" y="38" width={x(max) + 8} height="50" rx="8" fill="#FEF3C7" stroke="#D97706" strokeWidth="3" />
      {Array.from({ length: max + 1 }, (_, n) => (
        <Fragment key={n}>
          <line x1={x(n)} y1="38" x2={x(n)} y2="56" stroke="#92400E" strokeWidth="2.5" />
          <text x={x(n)} y="78" textAnchor="middle" fontSize="16" fontWeight="800" fill="#92400E">{n}</text>
        </Fragment>
      ))}
    </svg>
  );
}

function RectView({ w, h, unit }: { w: number; h: number; unit: string }) {
  const scale = Math.min(190 / w, 110 / h);
  const rw = w * scale;
  const rh = h * scale;
  const x0 = 30;
  const y0 = 30;
  return (
    <svg viewBox="0 0 280 180" width="280" height="180" role="img" aria-label={`Hình chữ nhật ${w} ${unit} × ${h} ${unit}`}>
      <rect x={x0} y={y0} width={rw} height={rh} fill="#DBEAFE" stroke={INK} strokeWidth="4" />
      <text x={x0 + rw / 2} y={y0 - 8} textAnchor="middle" fontSize="18" fontWeight="800" fill={INK}>{w} {unit}</text>
      <text x={x0 + rw + 10} y={y0 + rh / 2 + 6} fontSize="18" fontWeight="800" fill={INK}>{h} {unit}</text>
    </svg>
  );
}

function PieView({ parts, filled }: { parts: number; filled: number }) {
  const r = 70;
  const point = (deg: number): [number, number] => [90 + r * Math.cos(((deg - 90) * Math.PI) / 180), 90 + r * Math.sin(((deg - 90) * Math.PI) / 180)];
  return (
    <svg viewBox="0 0 180 180" width="170" height="170" role="img" aria-label={`Hình tròn chia thành ${parts} phần bằng nhau, tô màu ${filled} phần`}>
      {parts === 1 ? (
        <circle cx="90" cy="90" r={r} fill={filled ? '#5BA7FF' : '#FFFFFF'} stroke={INK} strokeWidth="4" />
      ) : (
        Array.from({ length: parts }, (_, k) => {
          const [x1, y1] = point((k * 360) / parts);
          const [x2, y2] = point(((k + 1) * 360) / parts);
          return <path key={k} d={`M90 90 L${x1} ${y1} A${r} ${r} 0 ${360 / parts > 180 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={k < filled ? '#5BA7FF' : '#FFFFFF'} stroke={INK} strokeWidth="4" strokeLinejoin="round" />;
        })
      )}
    </svg>
  );
}

function BarsView({ v }: { v: Extract<QuestionVisual, { kind: 'bars' }> }) {
  return (
    <div className="flex flex-col gap-2.5 w-full max-w-md">
      {v.items.map((it, k) => (
        <div key={k} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-sm font-black text-slate-600 text-right">{it.label}</span>
          <div className="flex gap-0.5" role="img" aria-label={`${it.label}: ${it.value} ${v.unit ?? ''}`}>
            {Array.from({ length: it.value }, (_, n) => (
              <span key={n} className="w-6 h-6 rounded-md border-2 border-white/70 shadow-xs" style={{ background: it.hex ?? '#5BA7FF' }} />
            ))}
          </div>
        </div>
      ))}
      {v.unit && <span className="text-xs font-bold text-slate-400 text-center">Mỗi ô là 1 {v.unit}</span>}
    </div>
  );
}

export function QuestionVisualView({ visual }: { visual: QuestionVisual }) {
  let body: ReactNode = null;
  switch (visual.kind) {
    case 'objects':
      body = <ObjectsView v={visual} />;
      break;
    case 'row':
      body = (
        <div className="flex flex-wrap items-center justify-center gap-4 text-5xl leading-none select-none">
          {visual.items.map((it, k) => <span key={k}>{it}</span>)}
        </div>
      );
      break;
    case 'picture':
      body = <span className="text-[6.5rem] leading-none select-none" role="img">{visual.emoji}</span>;
      break;
    case 'color':
      body = <span className="block w-32 h-32 rounded-3xl border-4 border-slate-300 shadow-inner" style={{ background: visual.hex }} role="img" aria-label="Màu sắc" />;
      break;
    case 'shape':
      body = <ShapeSvg shape={visual.shape} hex={visual.hex} size={140} />;
      break;
    case 'bars':
      body = <BarsView v={visual} />;
      break;
    case 'ruler':
      body = <RulerView length={visual.length} start={visual.start} />;
      break;
    case 'clock':
      body = <ClockView hour={visual.hour} minute={visual.minute} />;
      break;
    case 'rect':
      body = <RectView w={visual.w} h={visual.h} unit={visual.unit} />;
      break;
    case 'pie':
      body = <PieView parts={visual.parts} filled={visual.filled} />;
      break;
  }
  return <div className="flex items-center justify-center py-3 px-2 rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-100">{body}</div>;
}

// The inside of an answer button: the word, or a picture, or both
export function OptionBody({ text, face, textClass = '' }: { text: string; face?: OptionFace; textClass?: string }) {
  if (!face) return <span className={textClass}>{text}</span>;
  const count = face.emoji ? [...face.emoji].length : 0;
  const emojiSize = face.only ? 'text-5xl' : count > 5 ? 'text-xl' : 'text-3xl';
  return (
    <span className="flex items-center gap-3 flex-wrap">
      {face.shape ? (
        <ShapeSvg shape={face.shape} hex={face.hex} size={48} />
      ) : face.hex ? (
        <span className="block w-11 h-11 rounded-xl border-2 border-slate-300 shrink-0" style={{ background: face.hex }} />
      ) : null}
      {face.emoji && <span className={`${emojiSize} leading-none`} role="img" aria-label={text}>{face.emoji}</span>}
      {!face.only && <span className={textClass}>{text}</span>}
    </span>
  );
}

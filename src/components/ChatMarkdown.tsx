import React from 'react';

// Gemini answers with a little Markdown (**bold**, "* " bullets, "### " headings). The chat bubble used to
// print those symbols literally, so this renders the subset the tutor actually uses. No external library.

// **bold**, `code`, and *italic*. Italic only when the asterisks hug the text and are not glued to word
// characters, so a child's "2*3 và 4*5" is left alone.
const INLINE =
  /(\*\*(?:(?!\*\*)[^\n])+\*\*|`[^`\n]+`|(?<![\w*])\*(?=[^\s*])[^*\n]*?(?<=[^\s*])\*(?![\w*]))/g;

function renderInline(text: string): React.ReactNode[] {
  return text
    .split(INLINE)
    .filter(Boolean)
    .map((part, i) => {
      if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-black text-[#5B21B6]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1 rounded bg-slate-200/60">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
        return <em key={i}>{part.slice(1, -1)}</em>;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
}

interface ChatMarkdownProps {
  text: string;
}

export const ChatMarkdown: React.FC<ChatMarkdownProps> = ({ text }) => {
  return (
    <div className="flex flex-col gap-1">
      {text.split('\n').map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;

        // Nested bullets are indented by the model with spaces
        const indent = Math.min(48, Math.floor((line.length - line.trimStart().length) / 2) * 12);

        if (/^([-*_])\1{2,}$/.test(trimmed)) {
          return <hr key={i} className="border-slate-200 my-1" />;
        }

        const heading = trimmed.match(/^#{1,6}\s+(.*)$/);
        if (heading) {
          return (
            <div key={i} className="font-black text-base text-[#5B21B6] mt-1">
              {renderInline(heading[1])}
            </div>
          );
        }

        const bullet = trimmed.match(/^[*\-•]\s+(.*)$/);
        if (bullet) {
          return (
            <div key={i} className="flex gap-2" style={{ paddingLeft: 8 + indent }}>
              <span>•</span>
              <span className="flex-1">{renderInline(bullet[1])}</span>
            </div>
          );
        }

        const numbered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
        if (numbered) {
          return (
            <div key={i} className="flex gap-2" style={{ paddingLeft: 8 + indent }}>
              <span>{numbered[1]}.</span>
              <span className="flex-1">{renderInline(numbered[2])}</span>
            </div>
          );
        }

        return <div key={i}>{renderInline(trimmed)}</div>;
      })}
    </div>
  );
};

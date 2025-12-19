import { useRef, useEffect, useCallback, useMemo } from 'react';

interface FindMatch {
  start: number;
  end: number;
  line: number;
}

interface JsonEditorProps {
  content: string;
  onChange: (content: string) => void;
  onPaste: (text: string) => void;
  matches: FindMatch[];
  currentMatchIndex: number;
  errorLine?: number;
}

const highlightJson = (text: string, matches: FindMatch[], currentMatchIndex: number, errorLine?: number): string => {
  if (!text) return '';
  
  // First, escape HTML entities
  const escapeHtml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  // Apply find highlights first (before syntax highlighting)
  let result = escapeHtml(text);
  
  // Sort matches by start position in reverse order for replacement
  const sortedMatches = [...matches].sort((a, b) => b.start - a.start);
  
  // Calculate offset due to HTML escaping
  const getEscapedIndex = (originalIndex: number): number => {
    let escaped = escapeHtml(text.substring(0, originalIndex));
    return escaped.length;
  };

  // Apply match highlights
  sortedMatches.forEach((match, idx) => {
    const actualIdx = matches.length - 1 - idx;
    const isCurrent = actualIdx === currentMatchIndex;
    const highlightClass = isCurrent ? 'find-highlight-current' : 'find-highlight';
    
    const escapedStart = getEscapedIndex(match.start);
    const escapedEnd = getEscapedIndex(match.end);
    
    const before = result.substring(0, escapedStart);
    const matchText = result.substring(escapedStart, escapedEnd);
    const after = result.substring(escapedEnd);
    
    result = `${before}<mark class="${highlightClass}">${matchText}</mark>${after}`;
  });

  // JSON syntax highlighting regex patterns
  const patterns = [
    // Strings (keys and values) - must come first
    { regex: /(&quot;[^&]*&quot;)(\s*:)/g, replacement: '<span class="syntax-key">$1</span>$2' },
    { regex: /:\s*(&quot;[^&]*&quot;)/g, replacement: ': <span class="syntax-string">$1</span>' },
    // Numbers
    { regex: /:\s*(-?\d+\.?\d*(?:[eE][+-]?\d+)?)/g, replacement: ': <span class="syntax-number">$1</span>' },
    // Booleans
    { regex: /:\s*(true|false)/g, replacement: ': <span class="syntax-boolean">$1</span>' },
    // Null
    { regex: /:\s*(null)/g, replacement: ': <span class="syntax-null">$1</span>' },
    // Brackets
    { regex: /([{}\[\]])/g, replacement: '<span class="syntax-bracket">$1</span>' },
  ];

  patterns.forEach(({ regex, replacement }) => {
    result = result.replace(regex, replacement);
  });

  // Handle standalone string values in arrays
  result = result.replace(/,\s*(&quot;[^&]*&quot;)\s*(?=[,\]])/g, ', <span class="syntax-string">$1</span>');
  result = result.replace(/\[\s*(&quot;[^&]*&quot;)/g, '[ <span class="syntax-string">$1</span>');

  return result;
};

export const JsonEditor = ({
  content,
  onChange,
  onPaste,
  matches,
  currentMatchIndex,
  errorLine,
}: JsonEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const lines = content.split('\n');
  const lineCount = lines.length;

  const highlightedContent = useMemo(() => {
    return highlightJson(content, matches, currentMatchIndex, errorLine);
  }, [content, matches, currentMatchIndex, errorLine]);

  // Sync scroll between textarea and highlight layer
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current && lineNumbersRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    onPaste(text);
  }, [onPaste]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      onChange(newContent);
      
      // Set cursor position after the tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  }, [content, onChange]);

  // Scroll to current match
  useEffect(() => {
    if (currentMatchIndex >= 0 && currentMatchIndex < matches.length && textareaRef.current) {
      const match = matches[currentMatchIndex];
      const lines = content.substring(0, match.start).split('\n');
      const lineHeight = 24; // Approximate line height
      const scrollTop = (lines.length - 1) * lineHeight - 100;
      textareaRef.current.scrollTop = Math.max(0, scrollTop);
      handleScroll();
    }
  }, [currentMatchIndex, matches, content, handleScroll]);

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 flex overflow-hidden editor-container"
    >
      {/* Line numbers */}
      <div
        ref={lineNumbersRef}
        className="editor-gutter py-4 px-3 text-right select-none overflow-hidden shrink-0"
        style={{ minWidth: `${Math.max(3, String(lineCount).length + 1)}ch` }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i}
            className={`text-sm leading-6 ${errorLine === i + 1 ? 'text-destructive font-medium' : ''}`}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Editor area */}
      <div className="relative flex-1 overflow-hidden">
        {/* Syntax highlighted layer */}
        <pre
          ref={highlightRef}
          className="absolute inset-0 p-4 m-0 overflow-hidden pointer-events-none text-sm leading-6 whitespace-pre font-mono"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: highlightedContent || '&nbsp;' }}
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full p-4 resize-none bg-transparent text-transparent caret-foreground text-sm leading-6 font-mono focus:outline-none scrollbar-thin"
          placeholder="Paste or type your JSON here..."
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
        />
      </div>
    </div>
  );
};

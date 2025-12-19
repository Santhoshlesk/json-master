import { useEffect, useRef, useState } from 'react';
import { 
  X, 
  ChevronUp, 
  ChevronDown, 
  CaseSensitive, 
  WholeWord,
  Regex,
  Replace,
  ReplaceAll
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FindReplaceProps {
  isOpen: boolean;
  searchTerm: string;
  replaceTerm: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  matchCount: number;
  currentMatch: number;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onReplaceChange: (value: string) => void;
  onToggleCaseSensitive: () => void;
  onToggleWholeWord: () => void;
  onToggleRegex: () => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
}

export const FindReplace = ({
  isOpen,
  searchTerm,
  replaceTerm,
  caseSensitive,
  wholeWord,
  useRegex,
  matchCount,
  currentMatch,
  onClose,
  onSearchChange,
  onReplaceChange,
  onToggleCaseSensitive,
  onToggleWholeWord,
  onToggleRegex,
  onNextMatch,
  onPrevMatch,
  onReplace,
  onReplaceAll,
}: FindReplaceProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showReplace, setShowReplace] = useState(false);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const matchText = matchCount > 0 
    ? `${currentMatch + 1} of ${matchCount}` 
    : searchTerm ? 'No results' : '';

  return (
    <div className="absolute top-2 right-4 z-20 animate-fade-in">
      <div className="bg-card border rounded-lg shadow-lg p-3 space-y-2 min-w-[380px]">
        {/* Find row */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => setShowReplace(!showReplace)}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showReplace ? 'rotate-0' : '-rotate-90'}`} />
          </Button>
          
          <div className="relative flex-1">
            <Input
              ref={searchInputRef}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Find"
              className="h-8 pr-24 font-mono text-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={caseSensitive}
                    onPressedChange={onToggleCaseSensitive}
                    className="h-6 w-6 p-0"
                  >
                    <CaseSensitive className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Match Case</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={wholeWord}
                    onPressedChange={onToggleWholeWord}
                    className="h-6 w-6 p-0"
                  >
                    <WholeWord className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Match Whole Word</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={useRegex}
                    onPressedChange={onToggleRegex}
                    className="h-6 w-6 p-0"
                  >
                    <Regex className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>Use Regular Expression</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <span className="text-xs text-muted-foreground min-w-[70px] text-right">
            {matchText}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onPrevMatch}
              disabled={matchCount === 0}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onNextMatch}
              disabled={matchCount === 0}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Replace row */}
        {showReplace && (
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-6" /> {/* Spacer for alignment */}
            <Input
              value={replaceTerm}
              onChange={(e) => onReplaceChange(e.target.value)}
              placeholder="Replace"
              className="h-8 flex-1 font-mono text-sm"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onReplace}
                  disabled={matchCount === 0}
                >
                  <Replace className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Replace</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onReplaceAll}
                  disabled={matchCount === 0}
                >
                  <ReplaceAll className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Replace All</TooltipContent>
            </Tooltip>
            <div className="w-7" /> {/* Spacer for alignment with close button */}
          </div>
        )}
      </div>
    </div>
  );
};

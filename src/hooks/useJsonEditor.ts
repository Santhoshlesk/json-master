import { useState, useCallback, useEffect } from 'react';

interface ValidationResult {
  isValid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
}

interface FindMatch {
  start: number;
  end: number;
  line: number;
}

interface FindReplaceState {
  isOpen: boolean;
  searchTerm: string;
  replaceTerm: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  matches: FindMatch[];
  currentMatchIndex: number;
}

export const useJsonEditor = () => {
  const [content, setContent] = useState<string>('');
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true });
  const [autoFormatOnPaste, setAutoFormatOnPaste] = useState(false);
  const [findReplace, setFindReplace] = useState<FindReplaceState>({
    isOpen: false,
    searchTerm: '',
    replaceTerm: '',
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
    matches: [],
    currentMatchIndex: 0,
  });

  const validateJson = useCallback((text: string): ValidationResult => {
    if (!text.trim()) {
      return { isValid: true };
    }

    try {
      JSON.parse(text);
      return { isValid: true };
    } catch (e) {
      const error = e as SyntaxError;
      const match = error.message.match(/at position (\d+)/);
      let line = 1;
      let column = 1;

      if (match) {
        const position = parseInt(match[1], 10);
        const lines = text.substring(0, position).split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }

      return {
        isValid: false,
        error: {
          message: error.message,
          line,
          column,
        },
      };
    }
  }, []);

  const formatJson = useCallback(() => {
    if (!content.trim()) return;

    try {
      const parsed = JSON.parse(content);
      const formatted = JSON.stringify(parsed, null, 2);
      setContent(formatted);
      setValidation({ isValid: true });
    } catch (e) {
      setValidation(validateJson(content));
    }
  }, [content, validateJson]);

  const minifyJson = useCallback(() => {
    if (!content.trim()) return;

    try {
      const parsed = JSON.parse(content);
      const minified = JSON.stringify(parsed);
      setContent(minified);
      setValidation({ isValid: true });
    } catch (e) {
      setValidation(validateJson(content));
    }
  }, [content, validateJson]);

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(content);
  }, [content]);

  const clearContent = useCallback(() => {
    setContent('');
    setValidation({ isValid: true });
    setFindReplace(prev => ({ ...prev, matches: [], currentMatchIndex: 0 }));
  }, []);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setValidation(validateJson(newContent));
  }, [validateJson]);

  const handlePaste = useCallback((text: string) => {
    if (autoFormatOnPaste) {
      try {
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);
        setContent(formatted);
        setValidation({ isValid: true });
        return;
      } catch {
        // If parsing fails, just set the raw text
      }
    }
    setContent(text);
    setValidation(validateJson(text));
  }, [autoFormatOnPaste, validateJson]);

  const downloadJson = useCallback(() => {
    if (!content.trim()) return;

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [content]);

  const uploadJson = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (autoFormatOnPaste) {
        try {
          const parsed = JSON.parse(text);
          const formatted = JSON.stringify(parsed, null, 2);
          setContent(formatted);
          setValidation({ isValid: true });
          return;
        } catch {
          // Fall through to set raw text
        }
      }
      setContent(text);
      setValidation(validateJson(text));
    };
    reader.readAsText(file);
  }, [autoFormatOnPaste, validateJson]);

  // Find matches
  const findMatches = useCallback((
    text: string,
    searchTerm: string,
    caseSensitive: boolean,
    wholeWord: boolean,
    useRegex: boolean
  ): FindMatch[] => {
    if (!searchTerm || !text) return [];

    const matches: FindMatch[] = [];
    let regex: RegExp;

    try {
      let pattern = useRegex ? searchTerm : searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      regex = new RegExp(pattern, caseSensitive ? 'g' : 'gi');
    } catch {
      return [];
    }

    let match;
    while ((match = regex.exec(text)) !== null) {
      const lines = text.substring(0, match.index).split('\n');
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        line: lines.length,
      });
    }

    return matches;
  }, []);

  // Update matches when search params change
  useEffect(() => {
    const matches = findMatches(
      content,
      findReplace.searchTerm,
      findReplace.caseSensitive,
      findReplace.wholeWord,
      findReplace.useRegex
    );
    setFindReplace(prev => ({
      ...prev,
      matches,
      currentMatchIndex: matches.length > 0 ? 0 : -1,
    }));
  }, [content, findReplace.searchTerm, findReplace.caseSensitive, findReplace.wholeWord, findReplace.useRegex, findMatches]);

  const toggleFindReplace = useCallback((showReplace = false) => {
    setFindReplace(prev => ({
      ...prev,
      isOpen: !prev.isOpen || showReplace !== (prev.replaceTerm !== ''),
    }));
  }, []);

  const closeFindReplace = useCallback(() => {
    setFindReplace(prev => ({ ...prev, isOpen: false }));
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    setFindReplace(prev => ({ ...prev, searchTerm: term }));
  }, []);

  const setReplaceTerm = useCallback((term: string) => {
    setFindReplace(prev => ({ ...prev, replaceTerm: term }));
  }, []);

  const toggleCaseSensitive = useCallback(() => {
    setFindReplace(prev => ({ ...prev, caseSensitive: !prev.caseSensitive }));
  }, []);

  const toggleWholeWord = useCallback(() => {
    setFindReplace(prev => ({ ...prev, wholeWord: !prev.wholeWord }));
  }, []);

  const toggleUseRegex = useCallback(() => {
    setFindReplace(prev => ({ ...prev, useRegex: !prev.useRegex }));
  }, []);

  const goToNextMatch = useCallback(() => {
    setFindReplace(prev => ({
      ...prev,
      currentMatchIndex: prev.matches.length > 0
        ? (prev.currentMatchIndex + 1) % prev.matches.length
        : -1,
    }));
  }, []);

  const goToPrevMatch = useCallback(() => {
    setFindReplace(prev => ({
      ...prev,
      currentMatchIndex: prev.matches.length > 0
        ? (prev.currentMatchIndex - 1 + prev.matches.length) % prev.matches.length
        : -1,
    }));
  }, []);

  const replaceOne = useCallback(() => {
    if (findReplace.matches.length === 0 || findReplace.currentMatchIndex < 0) return;

    const match = findReplace.matches[findReplace.currentMatchIndex];
    const newContent = 
      content.substring(0, match.start) + 
      findReplace.replaceTerm + 
      content.substring(match.end);
    
    setContent(newContent);
    setValidation(validateJson(newContent));
  }, [content, findReplace.matches, findReplace.currentMatchIndex, findReplace.replaceTerm, validateJson]);

  const replaceAll = useCallback(() => {
    if (findReplace.matches.length === 0 || !findReplace.searchTerm) return;

    let pattern = findReplace.useRegex 
      ? findReplace.searchTerm 
      : findReplace.searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    if (findReplace.wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    try {
      const regex = new RegExp(pattern, findReplace.caseSensitive ? 'g' : 'gi');
      const newContent = content.replace(regex, findReplace.replaceTerm);
      setContent(newContent);
      setValidation(validateJson(newContent));
    } catch {
      // Invalid regex, do nothing
    }
  }, [content, findReplace, validateJson]);

  return {
    content,
    setContent: handleContentChange,
    validation,
    formatJson,
    minifyJson,
    copyToClipboard,
    clearContent,
    handlePaste,
    downloadJson,
    uploadJson,
    autoFormatOnPaste,
    setAutoFormatOnPaste,
    findReplace,
    toggleFindReplace,
    closeFindReplace,
    setSearchTerm,
    setReplaceTerm,
    toggleCaseSensitive,
    toggleWholeWord,
    toggleUseRegex,
    goToNextMatch,
    goToPrevMatch,
    replaceOne,
    replaceAll,
  };
};

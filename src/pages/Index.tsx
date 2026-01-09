import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Toolbar } from '@/components/Toolbar';
import { JsonEditor } from '@/components/JsonEditor';
import { FindReplace } from '@/components/FindReplace';
import { ValidationMessage } from '@/components/ValidationMessage';
import { useJsonEditor } from '@/hooks/useJsonEditor';
import { useTheme } from '@/hooks/useTheme';

const Index = () => {
  const { isDark, toggleTheme } = useTheme();
  const {
    content,
    setContent,
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
  } = useJsonEditor();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'f') {
        e.preventDefault();
        toggleFindReplace(false);
      } else if (isMod && e.key === 'h') {
        e.preventDefault();
        toggleFindReplace(true);
      } else if (e.key === 'Escape' && findReplace.isOpen) {
        closeFindReplace();
      } else if (e.key === 'Enter' && findReplace.isOpen && !e.shiftKey) {
        e.preventDefault();
        goToNextMatch();
      } else if (e.key === 'Enter' && findReplace.isOpen && e.shiftKey) {
        e.preventDefault();
        goToPrevMatch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [findReplace.isOpen, toggleFindReplace, closeFindReplace, goToNextMatch, goToPrevMatch]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      
      <Toolbar
        onFormat={formatJson}
        onMinify={minifyJson}
        onCopy={copyToClipboard}
        onClear={clearContent}
        onDownload={downloadJson}
        onUpload={uploadJson}
        autoFormatOnPaste={autoFormatOnPaste}
        onAutoFormatChange={setAutoFormatOnPaste}
        hasContent={!!content.trim()}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <FindReplace
          isOpen={findReplace.isOpen}
          searchTerm={findReplace.searchTerm}
          replaceTerm={findReplace.replaceTerm}
          caseSensitive={findReplace.caseSensitive}
          wholeWord={findReplace.wholeWord}
          useRegex={findReplace.useRegex}
          matchCount={findReplace.matches.length}
          currentMatch={findReplace.currentMatchIndex}
          onClose={closeFindReplace}
          onSearchChange={setSearchTerm}
          onReplaceChange={setReplaceTerm}
          onToggleCaseSensitive={toggleCaseSensitive}
          onToggleWholeWord={toggleWholeWord}
          onToggleRegex={toggleUseRegex}
          onNextMatch={goToNextMatch}
          onPrevMatch={goToPrevMatch}
          onReplace={replaceOne}
          onReplaceAll={replaceAll}
        />
        <JsonEditor
          content={content}
          onChange={setContent}
          onPaste={handlePaste}
          matches={findReplace.matches}
          currentMatchIndex={findReplace.currentMatchIndex}
          errorLine={validation.error?.line}
        />
      </div>

      <ValidationMessage
        isValid={validation.isValid}
        error={validation.error}
        hasContent={!!content.trim()}
      />
    </div>
  );
};

export default Index;

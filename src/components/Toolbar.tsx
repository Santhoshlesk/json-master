import { 
  Wand2, 
  Minimize2, 
  Copy, 
  Trash2, 
  Download, 
  Upload,
  Check,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState, useRef } from 'react';

interface ToolbarProps {
  onFormat: () => void;
  onMinify: () => void;
  onCopy: () => void;
  onClear: () => void;
  onDownload: () => void;
  onUpload: (file: File) => void;
  autoFormatOnPaste: boolean;
  onAutoFormatChange: (value: boolean) => void;
  hasContent: boolean;
}

export const Toolbar = ({
  onFormat,
  onMinify,
  onCopy,
  onClear,
  onDownload,
  onUpload,
  autoFormatOnPaste,
  onAutoFormatChange,
  hasContent,
}: ToolbarProps) => {
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
      e.target.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b bg-card/50 flex-wrap">
      <div className="flex items-center gap-2">
        <Button 
          onClick={onFormat} 
          disabled={!hasContent}
          size="sm"
          className="gap-2"
        >
          <Wand2 className="w-4 h-4" />
          Format
        </Button>
        <Button 
          onClick={onMinify} 
          disabled={!hasContent}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          <Minimize2 className="w-4 h-4" />
          Minify
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-2">
        <Button
          onClick={handleCopy}
          disabled={!hasContent}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button
          onClick={onClear}
          disabled={!hasContent}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
      </div>

      <div className="w-px h-6 bg-border mx-2" />

      <div className="flex items-center gap-2">
        <Button
          onClick={onDownload}
          disabled={!hasContent}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings2 className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64">
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Settings</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-format" className="text-sm text-muted-foreground">
                Auto-format on paste
              </Label>
              <Switch
                id="auto-format"
                checked={autoFormatOnPaste}
                onCheckedChange={onAutoFormatChange}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

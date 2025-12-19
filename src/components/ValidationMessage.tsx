import { AlertCircle, CheckCircle } from 'lucide-react';

interface ValidationMessageProps {
  isValid: boolean;
  error?: {
    message: string;
    line?: number;
    column?: number;
  };
  hasContent: boolean;
}

export const ValidationMessage = ({ isValid, error, hasContent }: ValidationMessageProps) => {
  if (!hasContent) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
        <span>Paste or type JSON to validate</span>
      </div>
    );
  }

  if (isValid) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-success">
        <CheckCircle className="w-4 h-4" />
        <span>Valid JSON</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-destructive bg-destructive/5">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span className="font-medium">
        {error?.line && error?.column && (
          <span className="mr-2">Line {error.line}, Column {error.column}:</span>
        )}
        {error?.message || 'Invalid JSON'}
      </span>
    </div>
  );
};

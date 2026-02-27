import { useCallback, useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileSelected, disabled }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv')) return;
      setFileName(file.name);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (disabled) return;
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  return (
    <Card
      className={`cursor-pointer border-2 border-dashed transition-colors ${
        dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <CardContent className="flex flex-col items-center justify-center py-10 gap-3">
        {fileName ? (
          <>
            <FileText className="h-10 w-10 text-primary" />
            <p className="text-sm font-medium text-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground">Click or drop to replace</p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Drop your CSV file here</p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </CardContent>
    </Card>
  );
}

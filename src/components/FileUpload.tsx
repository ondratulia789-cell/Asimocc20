import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload = ({ onFileUpload, isProcessing }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileUpload(file);
  }, [onFileUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  }, [onFileUpload]);

  const handleClick = () => document.getElementById('file-input')?.click();

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "group relative cursor-pointer rounded-2xl transition-all duration-300",
        isProcessing && "pointer-events-none opacity-50"
      )}
    >
      <button
        type="button"
        className={cn(
          "btn-brand w-full rounded-2xl py-4 px-5 font-display font-bold text-base flex items-center justify-center gap-2.5",
          isDragging && "scale-[1.02]"
        )}
      >
        <Upload className="h-5 w-5" />
        {isProcessing ? "Zpracovávám…" : "Nahraj svá data"}
      </button>

      <input
        id="file-input"
        type="file"
        accept=".json,.zip,.txt,text/plain,application/json,application/zip"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;

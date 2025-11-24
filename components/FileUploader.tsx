import React, { useCallback, useState } from 'react';
import { Upload, FileText, Loader2, CheckCircle, FileType } from 'lucide-react';

interface FileUploaderProps {
  onFileLoaded: (content: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);

    // Simulate processing delay for "Analysis"
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        // In a real app, here we would parse PDF/DOCX binary.
        // For this demo, we assume text-based content or pretend extraction happened.
        onFileLoaded(text);
        setIsProcessing(false);
      };
      reader.readAsText(file);
    }, 1500);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [onFileLoaded]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        border-2 border-dashed rounded-lg p-6 mb-4 text-center transition-all cursor-pointer group
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50' 
          : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-gray-100'}
      `}
    >
      <input 
        type="file" 
        className="hidden" 
        id="file-upload"
        accept=".txt,.xml,.json,.md,.html"
        onChange={handleFileInput}
      />
      <label htmlFor="file-upload" className="cursor-pointer w-full h-full block">
        {isProcessing ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="animate-spin text-indigo-600 mb-2" size={32} />
            <span className="text-sm font-medium text-gray-600">Extracting content from {fileName}...</span>
          </div>
        ) : fileName && !isDragging ? (
          <div className="flex flex-col items-center">
            <CheckCircle className="text-green-500 mb-2" size={32} />
            <span className="text-sm font-medium text-gray-800">{fileName} loaded</span>
            <span className="text-xs text-indigo-600 mt-1 hover:underline">Upload another file</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
              ${isDragging ? 'bg-indigo-200 text-indigo-700' : 'bg-white text-gray-400 border border-gray-200 group-hover:border-indigo-200 group-hover:text-indigo-500'}
            `}>
              <Upload size={20} />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">
              {isDragging ? 'Drop petition here' : 'Upload Petition or Contract'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Supports XML, TXT, JSON. (PDF/DOCX simulated)
            </p>
          </div>
        )}
      </label>
    </div>
  );
};

export default FileUploader;
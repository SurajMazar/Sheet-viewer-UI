
import React, { useRef, useState } from 'react';
import { Upload, FileCode, CheckCircle2, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
      onFileUpload(file);
    } else {
      alert("Please upload an Excel or CSV file.");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div 
      className={`relative group flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl transition-all ${
        isDragging 
          ? 'border-emerald-500 bg-emerald-50' 
          : 'border-slate-300 bg-white hover:border-emerald-400 hover:bg-slate-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileInput}
        accept=".xlsx, .xls, .csv"
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4 text-center px-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <p className="text-lg font-semibold text-slate-900">Parsing spreadsheet...</p>
            <p className="text-sm text-slate-500">Wait while we process your data</p>
          </div>
        ) : (
          <>
            <div className="p-4 bg-emerald-100 rounded-full group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">Upload your spreadsheet</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">
                Drag and drop your Excel (.xlsx, .xls) or CSV files here, or click to browse.
              </p>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
            >
              Select File
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 opacity-50">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <CheckCircle2 className="w-3 h-3" /> XLSX
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <CheckCircle2 className="w-3 h-3" /> XLS
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <CheckCircle2 className="w-3 h-3" /> CSV
        </div>
      </div>
    </div>
  );
};

export default FileUploader;

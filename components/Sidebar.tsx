
import React from 'react';
import { SheetData } from '../types';
import { Layers, FileText, ChevronRight } from 'lucide-react';

interface SidebarProps {
  sheets: SheetData[];
  activeIndex: number;
  onSelect: (index: number) => void;
  fileName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ sheets, activeIndex, onSelect, fileName }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Workbook</h2>
        </div>
        <p className="text-sm font-semibold truncate text-slate-700" title={fileName}>{fileName}</p>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Sheets</h3>
        </div>
        <nav className="space-y-1 px-2">
          {sheets.map((sheet, index) => (
            <button
              key={sheet.name}
              onClick={() => onSelect(index)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                index === activeIndex
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="truncate pr-2">{sheet.name}</span>
              {index === activeIndex && <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 bg-slate-50 mt-auto border-t border-slate-100">
        <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sheet Insight</p>
          <p className="text-xs text-slate-600 leading-tight">
            {sheets[activeIndex]?.data.length} records found in current view.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


import React, { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Search, 
  X, 
  Share2, 
  Printer, 
  BarChart3,
  HelpCircle,
  Plus,
  ChevronDown
} from 'lucide-react';
import { WorkbookData, SheetData, SelectionState } from './types';
import { parseRange, getColumnLetter, formatRange } from './utils/cellUtils';

import FileUploader from './components/FileUploader';
import VirtualizedGrid from './components/VirtualizedGrid';
import ChartPanel from './components/ChartPanel';

const App: React.FC = () => {
  const [workbook, setWorkbook] = useState<WorkbookData | null>(null);
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCharts, setShowCharts] = useState<boolean>(false);
  const [selection, setSelection] = useState<SelectionState>({
    activeCell: null,
    range: null
  });

  const activeSheet = useMemo(() => workbook?.sheets[activeSheetIndex] || null, [workbook, activeSheetIndex]);
  const highlightRange = useMemo(() => parseRange(rangeInput), [rangeInput]);

  const handleFileUpload = useCallback((file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const readWorkbook = XLSX.read(data, { type: 'array' });
        
        const sheets: SheetData[] = readWorkbook.SheetNames.map((name) => {
          const sheet = readWorkbook.Sheets[name];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];
          return {
            name,
            data: rows,
            dimensions: { rows: rows.length, cols: rows[0]?.length || 0 }
          };
        });

        setWorkbook({ fileName: file.name, sheets });
        setActiveSheetIndex(0);
      } catch (err) {
        console.error("Parsing error:", err);
        alert("Could not parse file. Ensure it is a valid Excel or CSV document.");
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const getActiveCellValue = () => {
    if (!selection.activeCell || !activeSheet) return "";
    return activeSheet.data[selection.activeCell.row]?.[selection.activeCell.col] ?? "";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 select-none">
      {/* 1. Sheets Header */}
      <header className="flex flex-col bg-white border-b shadow-sm z-50">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-green-600 rounded">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-gray-700 truncate max-w-[300px]">
                  {workbook ? workbook.fileName : "Untitled Spreadsheet"}
                </h1>
                <div className="px-1.5 py-0.5 rounded bg-blue-50 text-[9px] font-bold text-blue-600 uppercase border border-blue-100">READ ONLY</div>
              </div>
              <div className="flex gap-4 mt-0.5 text-[11px] text-gray-500">
                <button className="hover:bg-gray-100 px-1.5 rounded transition-colors">File</button>
                <button className="hover:bg-gray-100 px-1.5 rounded transition-colors">Edit</button>
                <button className="hover:bg-gray-100 px-1.5 rounded transition-colors">View</button>
                <button className="hover:bg-gray-100 px-1.5 rounded transition-colors">Insert</button>
                <button className="hover:bg-gray-100 px-1.5 rounded transition-colors">Format</button>
                <button className="hover:bg-gray-100 px-1.5 rounded transition-colors">Data</button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-full bg-blue-50 px-4 py-1.5 text-blue-700 text-xs font-semibold cursor-pointer hover:bg-blue-100 transition-colors">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Toolbar & Formula Bar */}
        <div className="flex flex-col bg-white border-t p-1 gap-1">
          <div className="flex items-center gap-1 px-2">
            <button onClick={() => window.print()} className="p-1.5 hover:bg-gray-100 rounded text-gray-600" title="Print"><Printer className="w-4 h-4" /></button>
            <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
            <button onClick={() => setShowCharts(!showCharts)} className={`p-1.5 rounded transition-colors ${showCharts ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-600'}`} title="Insights">
              <BarChart3 className="w-4 h-4" />
            </button>
            <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
            <div className="relative group flex-1 max-w-[240px]">
               <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search this sheet..." 
                 className="w-full bg-gray-100 border border-transparent rounded text-xs py-1.5 pl-8 pr-2 focus:bg-white focus:border-blue-500 outline-none transition-all"
               />
            </div>
          </div>
          
          <div className="flex items-center gap-0 border rounded overflow-hidden mx-1 mb-1">
            <div className="w-[100px] min-w-[100px] px-3 py-1 text-xs border-r font-medium text-gray-600 truncate bg-white flex items-center justify-between">
              {selection.activeCell ? `${getColumnLetter(selection.activeCell.col)}${selection.activeCell.row + 1}` : ""}
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <div className="flex items-center px-3 border-r bg-gray-50 text-gray-400 text-sm font-serif italic font-bold">
              fx
            </div>
            <input 
              type="text"
              readOnly
              value={String(getActiveCellValue())}
              className="flex-1 px-3 py-1 text-sm text-gray-700 bg-white outline-none"
              placeholder=""
            />
            <div className="flex items-center border-l bg-gray-50 px-2 gap-2 h-full">
               <input 
                  type="text" 
                  placeholder="Range selection" 
                  className="text-[11px] bg-transparent outline-none w-28 text-gray-500 font-medium"
                  value={rangeInput}
                  onChange={e => setRangeInput(e.target.value)}
               />
               {rangeInput && <X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-red-500" onClick={() => setRangeInput("")} />}
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Grid Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {!workbook ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
            <div className="w-full max-w-lg p-4">
               <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
               <div className="mt-8 text-center">
                  <h3 className="text-gray-900 font-medium">Ready to explore your data?</h3>
                  <p className="text-sm text-gray-500 mt-1">Upload any Excel or CSV file to begin. All processing happens locally in your browser.</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden relative border-r border-gray-300">
              <VirtualizedGrid 
                data={activeSheet?.data || []} 
                selection={selection}
                onSelectionChange={setSelection}
                highlightRange={highlightRange}
              />
              
              {/* Bottom Tabs */}
              <div className="h-[40px] bg-white border-t flex items-center px-3 gap-1 z-40 overflow-hidden shrink-0 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"><Plus className="w-4 h-4 text-gray-600" /></button>
                <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
                <div className="flex items-center h-full overflow-x-auto no-scrollbar">
                  {workbook.sheets.map((sheet, idx) => (
                    <button
                      key={sheet.name}
                      onClick={() => setActiveSheetIndex(idx)}
                      className={`h-full px-5 text-xs font-medium transition-all flex items-center border-x border-transparent relative ${
                        activeSheetIndex === idx 
                          ? 'text-green-700 bg-green-50/50 after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-green-600' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {sheet.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {showCharts && (
              <ChartPanel 
                data={activeSheet?.data || []} 
                selection={selection} 
                onClose={() => setShowCharts(false)}
              />
            )}
          </div>
        )}
      </main>

      {/* 4. Small Status Footer */}
      {workbook && (
        <footer className="h-6 bg-white border-t flex items-center px-4 justify-between text-[10px] text-gray-400 font-medium">
          <div className="flex items-center gap-3">
             <span className="text-green-600 font-bold uppercase tracking-wider">SheetLens Engine</span>
             <span>•</span>
             <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-gray-500 uppercase">{selection.range ? formatRange(selection.range) : ""}</span>
             <span>Rows: {activeSheet?.dimensions.rows.toLocaleString()}</span>
             <span>Cols: {activeSheet?.dimensions.cols.toLocaleString()}</span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;

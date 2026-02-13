
import React, { useState, useCallback, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Search, 
  X, 
  Grid3X3, 
  Settings, 
  Share2, 
  Printer, 
  Download, 
  BarChart3,
  HelpCircle,
  Plus
} from 'lucide-react';
import { WorkbookData, SheetData, SelectionState } from './types';
import { parseRange, getColumnLetter, formatRange } from './utils/cellUtils';

// Components
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

  const activeSheet = useMemo(() => {
    return workbook?.sheets[activeSheetIndex] || null;
  }, [workbook, activeSheetIndex]);

  const highlightRange = useMemo(() => {
    return parseRange(rangeInput);
  }, [rangeInput]);

  const handleFileUpload = useCallback((file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const readWorkbook = XLSX.read(data, { type: 'array' });
      
      const sheets: SheetData[] = readWorkbook.SheetNames.map((name) => {
        const sheet = readWorkbook.Sheets[name];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        return {
          name,
          data: rows,
          dimensions: {
            rows: rows.length,
            cols: rows[0]?.length || 0
          }
        };
      });

      setWorkbook({ fileName: file.name, sheets });
      setActiveSheetIndex(0);
      setIsLoading(false);
    };

    reader.onerror = () => {
      alert("Failed to read file.");
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const handleSelectionChange = (newSelection: SelectionState) => {
    setSelection(newSelection);
  };

  const getActiveCellValue = () => {
    if (!selection.activeCell || !activeSheet) return "";
    return activeSheet.data[selection.activeCell.row]?.[selection.activeCell.col] || "";
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 1. Top Global Navigation */}
      <nav className="flex items-center justify-between px-4 py-2 bg-white border-b shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-green-600 rounded">
            <FileSpreadsheet className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-gray-700 truncate max-w-[200px]">
                {workbook ? workbook.fileName : "Untitled Spreadsheet"}
              </h1>
              <div className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500 uppercase">View Only</div>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <button className="hover:bg-gray-100 px-1 rounded">File</button>
              <button className="hover:bg-gray-100 px-1 rounded">Edit</button>
              <button className="hover:bg-gray-100 px-1 rounded">View</button>
              <button className="hover:bg-gray-100 px-1 rounded">Format</button>
              <button className="hover:bg-gray-100 px-1 rounded">Tools</button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-full bg-blue-50 px-3 py-1.5 text-blue-700 text-xs font-medium cursor-pointer hover:bg-blue-100 transition-colors">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </div>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* 2. Toolbar & Formula Bar */}
      <div className="bg-white border-b px-2 py-1.5 flex flex-col gap-1.5 shadow-sm">
        <div className="flex items-center gap-1">
          <button onClick={() => window.print()} className="p-1.5 hover:bg-gray-100 rounded text-gray-600"><Printer className="w-4 h-4" /></button>
          <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
          <button onClick={() => setShowCharts(!showCharts)} className={`p-1.5 rounded transition-colors ${showCharts ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-600'}`}>
            <BarChart3 className="w-4 h-4" />
          </button>
          <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>
          <div className="relative group flex-1 max-w-[200px]">
             <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search spreadsheet..." 
               className="w-full bg-gray-100 rounded text-xs py-1.5 pl-7 pr-2 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
             />
          </div>
        </div>
        
        {/* Formula Bar */}
        <div className="flex items-center gap-0 bg-white border rounded">
          <div className="w-[120px] px-3 py-1 text-xs border-r font-medium text-gray-500 truncate bg-gray-50">
            {selection.activeCell ? `${getColumnLetter(selection.activeCell.col)}${selection.activeCell.row + 1}` : ""}
          </div>
          <div className="flex items-center px-2 border-r bg-gray-50 text-gray-400 italic text-[10px] font-bold">
            <i>fx</i>
          </div>
          <input 
            type="text"
            readOnly
            value={String(getActiveCellValue())}
            className="flex-1 px-3 py-1 text-sm text-gray-700 formula-bar-input"
            placeholder="Select a cell to view contents"
          />
          <div className="flex items-center border-l bg-gray-50 px-2 gap-2">
             <input 
                type="text" 
                placeholder="Range Highlight (e.g. A1:B5)" 
                className="text-[10px] bg-transparent outline-none w-32 border-none focus:ring-0"
                value={rangeInput}
                onChange={e => setRangeInput(e.target.value)}
             />
             {rangeInput && <X className="w-3 h-3 text-gray-400 cursor-pointer" onClick={() => setRangeInput("")} />}
          </div>
        </div>
      </div>

      {/* 3. Main Editor Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {!workbook ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-100">
            <div className="w-full max-w-xl">
               <FileUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
               <div className="mt-12 text-center text-gray-400">
                  <p className="text-sm">Trusted by teams to visualize millions of rows of spreadsheet data instantly.</p>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Grid */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <VirtualizedGrid 
                data={activeSheet?.data || []} 
                selection={selection}
                onSelectionChange={handleSelectionChange}
                highlightRange={highlightRange}
              />
              
              {/* Bottom Sheet Tabs */}
              <div className="h-10 bg-white border-t flex items-center px-4 gap-2 z-40">
                <button className="p-1 hover:bg-gray-100 rounded"><Plus className="w-4 h-4 text-gray-500" /></button>
                <div className="h-4 w-[1px] bg-gray-200 mx-2"></div>
                <div className="flex items-center h-full overflow-x-auto no-scrollbar">
                  {workbook.sheets.map((sheet, idx) => (
                    <button
                      key={sheet.name}
                      onClick={() => setActiveSheetIndex(idx)}
                      className={`h-full px-4 text-xs font-medium transition-colors border-b-2 flex items-center ${
                        activeSheetIndex === idx 
                          ? 'border-green-600 text-green-700 bg-green-50' 
                          : 'border-transparent text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {sheet.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Side Panel */}
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

      {/* 4. Footer Info Bar */}
      {workbook && (
        <footer className="h-6 bg-white border-t flex items-center px-4 justify-between text-[10px] text-gray-500 font-medium">
          <div className="flex items-center gap-4">
             <span>Explore</span>
             <span>|</span>
             <span>Status: Ready</span>
          </div>
          <div className="flex items-center gap-4">
             <span>{selection.range ? formatRange(selection.range) : "No Selection"}</span>
             <span>Rows: {activeSheet?.dimensions.rows.toLocaleString()}</span>
             <span>Cols: {activeSheet?.dimensions.cols.toLocaleString()}</span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;

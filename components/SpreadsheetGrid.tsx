
import React, { useMemo } from 'react';
import { HighlightRange } from '../types';
import { isCellInRange, getColumnLetter } from '../utils/cellUtils';

interface SpreadsheetGridProps {
  data: any[][];
  highlightRange: HighlightRange | null;
}

const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({ data, highlightRange }) => {
  // Ensure we have at least an empty grid if data is sparse
  const numRows = Math.max(data.length, 50);
  const numCols = Math.max(data[0]?.length || 0, 26);

  const columnHeaders = useMemo(() => {
    return Array.from({ length: numCols }, (_, i) => getColumnLetter(i));
  }, [numCols]);

  return (
    <div className="w-full h-full overflow-auto">
      <table className="min-w-full border-collapse table-fixed text-xs">
        <thead className="sticky top-0 z-20">
          <tr className="bg-slate-100 border-b border-slate-200">
            {/* Top-left corner spacer */}
            <th className="w-12 h-8 sticky left-0 z-30 bg-slate-100 border-r border-slate-200"></th>
            {columnHeaders.map((header, idx) => (
              <th 
                key={header} 
                className={`w-32 h-8 font-medium text-slate-500 border-r border-slate-200 text-center uppercase tracking-tighter ${
                  highlightRange && idx >= highlightRange.startCol && idx <= highlightRange.endCol ? 'bg-emerald-50 text-emerald-700' : ''
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: numRows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="group hover:bg-slate-50 border-b border-slate-100">
              {/* Row Header */}
              <td 
                className={`sticky left-0 z-10 w-12 h-8 bg-slate-100 border-r border-slate-200 text-center font-medium text-slate-400 group-hover:text-slate-600 ${
                  highlightRange && rowIndex >= highlightRange.startRow && rowIndex <= highlightRange.endRow ? 'bg-emerald-50 text-emerald-700' : ''
                }`}
              >
                {rowIndex + 1}
              </td>
              
              {/* Data Cells */}
              {Array.from({ length: numCols }).map((_, colIndex) => {
                const cellValue = data[rowIndex]?.[colIndex];
                const highlighted = isCellInRange(rowIndex, colIndex, highlightRange);
                
                return (
                  <td 
                    key={colIndex} 
                    className={`h-8 border-r border-slate-100 px-3 truncate relative transition-colors duration-100 ${
                      highlighted 
                        ? 'bg-emerald-500/10 text-emerald-900 border-emerald-200 font-medium' 
                        : 'text-slate-600'
                    }`}
                    title={cellValue?.toString() || ''}
                  >
                    {cellValue !== undefined ? cellValue.toString() : ''}
                    {highlighted && (
                       <div className="absolute inset-0 border-2 border-emerald-500/20 pointer-events-none" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-slate-400 text-sm italic">This sheet is empty</p>
        </div>
      )}
    </div>
  );
};

export default SpreadsheetGrid;

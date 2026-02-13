import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { HighlightRange, SelectionState } from '../types';
import { getColumnLetter, isCellInRange } from '../utils/cellUtils';

interface VirtualizedGridProps {
  data: any[][];
  selection: SelectionState;
  onSelectionChange: (selection: SelectionState) => void;
  highlightRange: HighlightRange | null;
}

const CELL_WIDTH = 100;
const CELL_HEIGHT = 22; 
const HEADER_WIDTH = 46;
const HEADER_HEIGHT = 22;

const VirtualizedGrid: React.FC<VirtualizedGridProps> = ({ data, selection, onSelectionChange, highlightRange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ top: 0, left: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  // Ensure grid is at least a minimum size for viewing
  const numRows = Math.max(data.length, 100);
  const numCols = Math.max(data[0]?.length || 0, 26);

  const updateViewport = useCallback(() => {
    if (containerRef.current) {
      setViewport({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
  }, []);

  useEffect(() => {
    updateViewport();
    
    // Use ResizeObserver for more reliable layout updates
    const observer = new ResizeObserver(updateViewport);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    window.addEventListener('resize', updateViewport);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateViewport);
    };
  }, [updateViewport]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScroll({
      top: e.currentTarget.scrollTop,
      left: e.currentTarget.scrollLeft
    });
  };

  const visibleRows = useMemo(() => {
    const start = Math.floor(scroll.top / CELL_HEIGHT);
    const count = Math.ceil((viewport.height || window.innerHeight) / CELL_HEIGHT) + 5;
    const result = [];
    for (let i = 0; i < count; i++) {
      if (start + i < numRows) result.push(start + i);
    }
    return result;
  }, [scroll.top, viewport.height, numRows]);

  const visibleCols = useMemo(() => {
    const start = Math.floor(scroll.left / CELL_WIDTH);
    const count = Math.ceil((viewport.width || window.innerWidth) / CELL_WIDTH) + 5;
    const result = [];
    for (let i = 0; i < count; i++) {
      if (start + i < numCols) result.push(start + i);
    }
    return result;
  }, [scroll.left, viewport.width, numCols]);

  const handleCellClick = (row: number, col: number) => {
    onSelectionChange({
      activeCell: { row, col },
      range: { startRow: row, endRow: row, startCol: col, endCol: col }
    });
  };

  return (
    <div className="relative w-full h-full bg-[#E1E3E1] flex flex-col overflow-hidden">
      <div 
        ref={containerRef}
        onScroll={onScroll}
        className="flex-1 overflow-auto relative outline-none bg-white"
        tabIndex={0}
      >
        <div style={{ 
          width: numCols * CELL_WIDTH + HEADER_WIDTH, 
          height: numRows * CELL_HEIGHT + HEADER_HEIGHT,
          position: 'relative'
        }}>
          
          {/* Column Headers (Sticky Top) */}
          <div className="sticky top-0 z-30 h-[22px] bg-white flex" style={{ marginLeft: HEADER_WIDTH }}>
            {visibleCols.map(colIdx => (
              <div 
                key={`col-${colIdx}`}
                className={`grid-header absolute h-[22px] border-r border-b border-[#d1d5db] ${selection.range && colIdx >= selection.range.startCol && colIdx <= selection.range.endCol ? 'active' : ''}`}
                style={{ width: CELL_WIDTH, left: colIdx * CELL_WIDTH }}
              >
                {getColumnLetter(colIdx)}
              </div>
            ))}
          </div>

          {/* Row Headers (Sticky Left) */}
          <div className="sticky left-0 z-20 w-[46px] bg-white" style={{ marginTop: HEADER_HEIGHT }}>
            {visibleRows.map(rowIdx => (
              <div 
                key={`row-${rowIdx}`}
                className={`grid-header absolute w-[46px] border-r border-b border-[#d1d5db] ${selection.range && rowIdx >= selection.range.startRow && rowIdx <= selection.range.endRow ? 'active' : ''}`}
                style={{ height: CELL_HEIGHT, top: rowIdx * CELL_HEIGHT }}
              >
                {rowIdx + 1}
              </div>
            ))}
          </div>

          {/* Top-Left Corner Piece */}
          <div className="sticky top-0 left-0 z-40 bg-[#f8f9fa] border-r border-b border-[#d1d5db]" style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }}></div>

          {/* Grid Content */}
          <div className="relative z-10" style={{ marginLeft: HEADER_WIDTH, marginTop: HEADER_HEIGHT }}>
            {visibleRows.map(rowIdx => (
              <React.Fragment key={`row-data-${rowIdx}`}>
                {visibleCols.map(colIdx => {
                  const val = data[rowIdx]?.[colIdx];
                  const isActive = selection.activeCell?.row === rowIdx && selection.activeCell?.col === colIdx;
                  const inRange = isCellInRange(rowIdx, colIdx, selection.range);
                  const inHighlight = isCellInRange(rowIdx, colIdx, highlightRange);
                  
                  return (
                    <div 
                      key={`cell-${rowIdx}-${colIdx}`}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                      className={`absolute border-r border-b border-[#e2e2e2] px-1.5 text-[12px] text-[#3c4043] truncate leading-[21px] cursor-cell select-none transition-colors duration-75 ${
                        isActive ? 'cell-active' : (inRange || inHighlight) ? 'cell-in-range' : ''
                      }`}
                      style={{ 
                        width: CELL_WIDTH, 
                        height: CELL_HEIGHT, 
                        left: colIdx * CELL_WIDTH, 
                        top: rowIdx * CELL_HEIGHT 
                      }}
                      title={val !== undefined ? String(val) : ''}
                    >
                      {val !== undefined ? String(val) : ''}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedGrid;
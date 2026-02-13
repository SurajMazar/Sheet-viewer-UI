
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
const CELL_HEIGHT = 25;
const HEADER_WIDTH = 45;
const HEADER_HEIGHT = 25;

const VirtualizedGrid: React.FC<VirtualizedGridProps> = ({ data, selection, onSelectionChange, highlightRange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({ top: 0, left: 0 });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const numRows = Math.max(data.length, 1000);
  const numCols = Math.max(data[0]?.length || 0, 52);

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
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, [updateViewport]);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScroll({
      top: e.currentTarget.scrollTop,
      left: e.currentTarget.scrollLeft
    });
  };

  const visibleRows = useMemo(() => {
    const start = Math.floor(scroll.top / CELL_HEIGHT);
    const count = Math.ceil(viewport.height / CELL_HEIGHT) + 2;
    return Array.from({ length: Math.min(count, numRows - start) }, (_, i) => start + i);
  }, [scroll.top, viewport.height, numRows]);

  const visibleCols = useMemo(() => {
    const start = Math.floor(scroll.left / CELL_WIDTH);
    const count = Math.ceil(viewport.width / CELL_WIDTH) + 2;
    return Array.from({ length: Math.min(count, numCols - start) }, (_, i) => start + i);
  }, [scroll.left, viewport.width, numCols]);

  const handleCellClick = (row: number, col: number, e: React.MouseEvent) => {
    onSelectionChange({
      activeCell: { row, col },
      range: { startRow: row, endRow: row, startCol: col, endCol: col }
    });
  };

  return (
    <div className="relative w-full h-full bg-white flex flex-col overflow-hidden">
      {/* Grid Canvas */}
      <div 
        ref={containerRef}
        onScroll={onScroll}
        className="flex-1 overflow-auto relative outline-none"
        tabIndex={0}
      >
        <div style={{ width: numCols * CELL_WIDTH + HEADER_WIDTH, height: numRows * CELL_HEIGHT + HEADER_HEIGHT }}>
          
          {/* Column Headers (Sticky Top) */}
          <div className="sticky top-0 z-30 flex h-[25px]" style={{ marginLeft: HEADER_WIDTH }}>
            {visibleCols.map(colIdx => (
              <div 
                key={`col-${colIdx}`}
                className="grid-header flex items-center justify-center border-r border-b border-gray-300 shrink-0"
                style={{ width: CELL_WIDTH, transform: `translateX(${colIdx * CELL_WIDTH - scroll.left}px)`, position: 'absolute' }}
              >
                {getColumnLetter(colIdx)}
              </div>
            ))}
          </div>

          {/* Row Headers (Sticky Left) */}
          <div className="sticky left-0 z-20 w-[45px]" style={{ marginTop: HEADER_HEIGHT }}>
            {visibleRows.map(rowIdx => (
              <div 
                key={`row-${rowIdx}`}
                className="grid-header flex items-center justify-center border-r border-b border-gray-300"
                style={{ height: CELL_HEIGHT, transform: `translateY(${rowIdx * CELL_HEIGHT - scroll.top}px)`, position: 'absolute', width: HEADER_WIDTH }}
              >
                {rowIdx + 1}
              </div>
            ))}
          </div>

          {/* Top-Left Corner */}
          <div className="sticky top-0 left-0 z-40 bg-gray-100 border-r border-b border-gray-300" style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }}></div>

          {/* Grid Cells */}
          <div className="relative z-10" style={{ marginLeft: HEADER_WIDTH, marginTop: HEADER_HEIGHT }}>
            {visibleRows.map(rowIdx => (
              <React.Fragment key={`row-data-${rowIdx}`}>
                {visibleCols.map(colIdx => {
                  const val = data[rowIdx]?.[colIdx];
                  const isActive = selection.activeCell?.row === rowIdx && selection.activeCell?.col === colIdx;
                  const isHighlighted = isCellInRange(rowIdx, colIdx, selection.range) || isCellInRange(rowIdx, colIdx, highlightRange);
                  
                  return (
                    <div 
                      key={`cell-${rowIdx}-${colIdx}`}
                      onClick={(e) => handleCellClick(rowIdx, colIdx, e)}
                      className={`absolute border-r border-b border-gray-200 px-1 text-xs truncate leading-[24px] cursor-cell select-none ${
                        isActive ? 'cell-selected' : isHighlighted ? 'cell-highlighted' : ''
                      }`}
                      style={{ 
                        width: CELL_WIDTH, 
                        height: CELL_HEIGHT, 
                        left: colIdx * CELL_WIDTH, 
                        top: rowIdx * CELL_HEIGHT 
                      }}
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

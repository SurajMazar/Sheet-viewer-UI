
export interface SheetData {
  name: string;
  data: any[][];
  dimensions: {
    rows: number;
    cols: number;
  };
}

export interface WorkbookData {
  sheets: SheetData[];
  fileName: string;
}

export interface HighlightRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export interface SelectionState {
  activeCell: { row: number; col: number } | null;
  range: HighlightRange | null;
}

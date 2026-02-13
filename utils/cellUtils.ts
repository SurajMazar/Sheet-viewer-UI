
import { HighlightRange } from '../types';

export const columnLetterToIndex = (letter: string): number => {
  let column = 0;
  const length = letter.length;
  for (let i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column - 1;
};

export const getColumnLetter = (index: number): string => {
  let letter = '';
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
};

export const parseRange = (rangeStr: string): HighlightRange | null => {
  if (!rangeStr || !rangeStr.trim()) return null;

  const parts = rangeStr.toUpperCase().trim().split(':');
  
  const parseCell = (cell: string) => {
    const match = cell.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;
    return {
      col: columnLetterToIndex(match[1]),
      row: parseInt(match[2], 10) - 1
    };
  };

  if (parts.length === 1) {
    const cell = parseCell(parts[0]);
    if (!cell) return null;
    return {
      startRow: cell.row,
      endRow: cell.row,
      startCol: cell.col,
      endCol: cell.col
    };
  } else if (parts.length === 2) {
    const start = parseCell(parts[0]);
    const end = parseCell(parts[1]);
    if (!start || !end) return null;
    return {
      startRow: Math.min(start.row, end.row),
      endRow: Math.max(start.row, end.row),
      startCol: Math.min(start.col, end.col),
      endCol: Math.max(start.col, end.col)
    };
  }

  return null;
};

export const isCellInRange = (row: number, col: number, range: HighlightRange | null): boolean => {
  if (!range) return false;
  return (
    row >= range.startRow &&
    row <= range.endRow &&
    col >= range.startCol &&
    col <= range.endCol
  );
};

export const formatRange = (range: HighlightRange | null): string => {
  if (!range) return "";
  const start = `${getColumnLetter(range.startCol)}${range.startRow + 1}`;
  if (range.startRow === range.endRow && range.startCol === range.endCol) return start;
  const end = `${getColumnLetter(range.endCol)}${range.endRow + 1}`;
  return `${start}:${end}`;
};

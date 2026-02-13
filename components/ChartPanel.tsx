
import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { SelectionState } from '../types';
import { BarChart3, TrendingUp, PieChart as PieIcon, X } from 'lucide-react';

interface ChartPanelProps {
  data: any[][];
  selection: SelectionState;
  onClose: () => void;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ data, selection, onClose }) => {
  const chartData = useMemo(() => {
    if (!selection.range) return [];
    const { startRow, endRow, startCol, endCol } = selection.range;
    
    // We assume the first column of the range is the label
    const results = [];
    for (let r = startRow; r <= endRow; r++) {
      const row = data[r];
      if (!row) continue;
      
      const entry: any = { name: row[startCol] || `Row ${r + 1}` };
      for (let c = startCol + 1; c <= endCol; c++) {
        const val = parseFloat(row[c]);
        if (!isNaN(val)) {
          entry[`Value ${c - startCol}`] = val;
        }
      }
      results.push(entry);
    }
    return results;
  }, [data, selection.range]);

  const COLORS = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#a142f4', '#24c1e0'];

  if (!selection.range || chartData.length === 0) {
    return (
      <div className="w-80 border-l bg-white p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-blue-50 p-4 rounded-full mb-4">
          <BarChart3 className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">No data selected</h3>
        <p className="text-sm text-gray-500">Select a range of cells with numbers to generate a chart preview.</p>
      </div>
    );
  }

  return (
    <div className="w-96 border-l bg-white flex flex-col shadow-xl z-50">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Data Insights
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-8">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Bar Distribution
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} hide />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="Value 1" fill="#1a73e8" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Trends
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} hide />
                <YAxis fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="Value 1" stroke="#34a853" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1">
            <PieIcon className="w-3 h-3" /> Proportion
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="Value 1"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  fill="#8884d8"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartPanel;

import React from 'react';
import { Plus, Trash2, Eye } from 'lucide-react';
import Button from '../common/Button.jsx';

const DEFAULT_CATEGORIES = ['Classic', 'Prime', 'Recliner', 'VIP'];

export const LayoutBuilder = ({ rows = [], onChange }) => {
  const handleAddRow = () => {
    // Generate next alphabet letter for row label
    const nextLetter = String.fromCharCode(65 + rows.length); // A, B, C...
    const newRow = {
      label: nextLetter,
      seatCount: 12,
      category: 'Classic',
      aisleAfter: [],
    };
    onChange([...rows, newRow]);
  };

  const handleRemoveRow = (index) => {
    const updated = rows.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  // Compute total seat capacity
  const totalSeats = rows.reduce((sum, r) => sum + (parseInt(r.seatCount, 10) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-ink">Screen Layout Rows</h4>
          <p className="text-xs text-muted">
            Configure rows, capacities (1–30), categories, and aisle breaks. Total capacity: <span className="font-bold text-primary">{totalSeats} seats</span>.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddRow}
          className="gap-1.5 text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Row</span>
        </Button>
      </div>

      {/* Rows Table */}
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="p-3 bg-gray-50 border border-border rounded-md grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
          >
            {/* Label */}
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-muted uppercase">Label</label>
              <input
                type="text"
                value={row.label}
                maxLength={4}
                onChange={(e) => handleRowChange(idx, 'label', e.target.value.toUpperCase())}
                className="w-full bg-white border border-border rounded-xs px-2 py-1 text-xs font-bold text-center uppercase focus:outline-none focus:border-primary"
              />
            </div>

            {/* Seat Count (1-30) */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-muted uppercase">Seats (1-30)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={row.seatCount}
                onChange={(e) =>
                  handleRowChange(
                    idx,
                    'seatCount',
                    Math.max(1, Math.min(30, parseInt(e.target.value, 10) || 1))
                  )
                }
                className="w-full bg-white border border-border rounded-xs px-2 py-1 text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>

            {/* Category */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-muted uppercase">Category</label>
              <input
                type="text"
                list={`cats-${idx}`}
                value={row.category}
                onChange={(e) => handleRowChange(idx, 'category', e.target.value)}
                placeholder="e.g. Classic"
                className="w-full bg-white border border-border rounded-xs px-2 py-1 text-xs font-semibold focus:outline-none focus:border-primary"
              />
              <datalist id={`cats-${idx}`}>
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Aisle Positions */}
            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-muted uppercase">
                Aisles After (e.g. 4, 8)
              </label>
              <input
                type="text"
                value={
                  Array.isArray(row.aisleAfter)
                    ? row.aisleAfter.join(', ')
                    : row.aisleAfter || ''
                }
                onChange={(e) => {
                  const numbers = e.target.value
                    .split(',')
                    .map((s) => parseInt(s.trim(), 10))
                    .filter((n) => !isNaN(n));
                  handleRowChange(idx, 'aisleAfter', numbers);
                }}
                placeholder="e.g. 4, 8"
                className="w-full bg-white border border-border rounded-xs px-2 py-1 text-xs font-semibold focus:outline-none focus:border-primary"
              />
            </div>

            {/* Delete button */}
            <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
              <button
                type="button"
                onClick={() => handleRemoveRow(idx)}
                className="text-muted hover:text-danger p-1 rounded-xs transition-colors cursor-pointer"
                title="Remove row"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Seat Preview Visualizer */}
      <div className="mt-8 pt-6 border-t border-border space-y-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
            Live Layout Preview
          </h4>
        </div>

        <div className="p-6 bg-gray-100 rounded-lg overflow-x-auto flex flex-col items-center select-none">
          {/* Cinema Screen Indicator */}
          <div className="w-64 h-2 bg-gray-400 rounded-t-full mb-8 shadow-xs" />

          {/* Seat Layout Grid */}
          <div className="space-y-2">
            {rows.map((row, rIdx) => {
              const aisles = new Set(row.aisleAfter || []);
              const seats = Array.from({ length: row.seatCount || 0 }, (_, i) => i + 1);

              return (
                <div key={rIdx} className="flex items-center gap-2">
                  <span className="w-5 text-[10px] font-bold text-muted text-center">
                    {row.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {seats.map((seatNum) => (
                      <div
                        key={seatNum}
                        className={`w-5 h-5 rounded-[2px] bg-white border border-[#10B981] text-[#059669] text-[9px] font-bold flex items-center justify-center shadow-2xs ${
                          aisles.has(seatNum) ? 'mr-3' : ''
                        }`}
                        title={`Row ${row.label} Seat ${seatNum} (${row.category})`}
                      >
                        {seatNum}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutBuilder;

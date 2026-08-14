import React, { useState } from 'react';
import { X, Sliders, Plus, Trash2, HelpCircle } from 'lucide-react';
import { CustomFieldDefinition } from '../types';

interface CustomFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customColumns: CustomFieldDefinition[];
  onAddColumn: (col: CustomFieldDefinition) => void;
  onDeleteColumn: (id: string) => void;
}

export const CustomFieldsModal: React.FC<CustomFieldsModalProps> = ({
  isOpen,
  onClose,
  customColumns = [],
  onAddColumn,
  onDeleteColumn
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'text' | 'number' | 'percentage' | 'select'>('text');
  const [optionsStr, setOptionsStr] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const options = type === 'select'
      ? optionsStr.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const col: CustomFieldDefinition = {
      id: `cf-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: name.trim(),
      type,
      options,
    };

    onAddColumn(col);
    setName('');
    setOptionsStr('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Custom Sizing Columns</h3>
              <p className="text-xs text-zinc-400">Add dynamic user-defined fields across all data sources</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Form */}
          <form onSubmit={handleAdd} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 block">
              Create New Column
            </span>
            <div>
              <label className="text-xs text-zinc-500 font-medium block mb-1">Column Header Name</label>
              <input
                type="text"
                placeholder="e.g. Region, Retention Days, Tier, Cloud Provider"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 font-medium block mb-1">Field Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="percentage">Percentage (%)</option>
                  <option value="select">Dropdown Select</option>
                </select>
              </div>

              {type === 'select' && (
                <div>
                  <label className="text-xs text-zinc-500 font-medium block mb-1">Options (comma separated)</label>
                  <input
                    type="text"
                    placeholder="AWS, GCP, Azure"
                    value={optionsStr}
                    onChange={(e) => setOptionsStr(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Column to Grid</span>
            </button>
          </form>

          {/* Current Custom Columns */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
              Active Custom Columns ({customColumns.length})
            </span>
            {customColumns.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">No custom columns added yet.</p>
            ) : (
              customColumns.map((col) => (
                <div
                  key={col.id}
                  className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-zinc-900">{col.name}</span>
                    <span className="text-[11px] text-zinc-400 ml-2">({col.type})</span>
                  </div>
                  <button
                    onClick={() => onDeleteColumn(col.id)}
                    className="text-zinc-400 hover:text-rose-600 p-1 transition"
                    title="Remove Column"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-200 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useStartupStore } from '../store/startupStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import { Sparkles, RefreshCw, Save, Edit3, Trash2, Plus } from 'lucide-react';

export const BusinessModelCanvas: React.FC = () => {
  const { setCredits } = useAuthStore();
  const { activeStartup, activeModules, setActiveModules } = useStartupStore();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Local state for editing boxes
  const [canvasData, setCanvasData] = useState({
    keyPartners: [] as string[],
    keyActivities: [] as string[],
    keyResources: [] as string[],
    valuePropositions: [] as string[],
    customerRelationships: [] as string[],
    channels: [] as string[],
    customerSegments: [] as string[],
    costStructure: [] as string[],
    revenueStreams: [] as string[],
  });

  const rawCanvas = activeModules?.businessModel;

  // Sync database data to local state
  useEffect(() => {
    if (rawCanvas) {
      setCanvasData({
        keyPartners: rawCanvas.keyPartners || [],
        keyActivities: rawCanvas.keyActivities || [],
        keyResources: rawCanvas.keyResources || [],
        valuePropositions: rawCanvas.valuePropositions || [],
        customerRelationships: rawCanvas.customerRelationships || [],
        channels: rawCanvas.channels || [],
        customerSegments: rawCanvas.customerSegments || [],
        costStructure: rawCanvas.costStructure || [],
        revenueStreams: rawCanvas.revenueStreams || [],
      });
    }
  }, [rawCanvas]);

  const handleGenerate = async () => {
    if (!activeStartup) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/ai/business-model', {
        method: 'POST',
        body: { startupId: activeStartup._id },
      });

      if (res.success) {
        if (res.userCredits !== undefined) {
          setCredits(res.userCredits);
        }
        setActiveModules({
          ...activeModules,
          businessModel: res.businessModel,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!activeStartup) return;
    setSaving(true);
    setError(null);

    try {
      const res = await apiRequest('/ai/business-model/update', {
        method: 'POST',
        body: {
          startupId: activeStartup._id,
          canvasData,
        },
      });

      if (res.success) {
        setActiveModules({
          ...activeModules,
          businessModel: res.businessModel,
        });
        setEditMode(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof canvasData, idx: number, val: string) => {
    setCanvasData((prev) => {
      const copy = { ...prev };
      copy[field][idx] = val;
      return copy;
    });
  };

  const handleAddPoint = (field: keyof typeof canvasData) => {
    setCanvasData((prev) => {
      const copy = { ...prev };
      copy[field] = [...copy[field], 'New detail point'];
      return copy;
    });
  };

  const handleRemovePoint = (field: keyof typeof canvasData, idx: number) => {
    setCanvasData((prev) => {
      const copy = { ...prev };
      copy[field] = copy[field].filter((_, i) => i !== idx);
      return copy;
    });
  };

  // Canvas Box Renderer Helper
  const renderBox = (title: string, field: keyof typeof canvasData, desc: string, rowSpan = 'row-span-1', colSpan = 'col-span-1') => {
    const list = canvasData[field];
    return (
      <div className={`rounded-custom border border-dark-border bg-dark-card p-5 flex flex-col justify-between ${rowSpan} ${colSpan} transition-all`}>
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-[11px] font-bold text-gold uppercase tracking-wider font-mono">
              {title}
            </h3>
            {editMode && (
              <button
                onClick={() => handleAddPoint(field)}
                className="text-[10px] text-gold hover:text-white flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            )}
          </div>
          <p className="text-[9px] text-gray-500 mb-4">{desc}</p>
          
          <ul className="space-y-3 flex-1">
            {list?.map((point, idx) => (
              <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 group">
                {!editMode ? (
                  <>
                    <span className="text-gold shrink-0">•</span>
                    <span className="leading-relaxed">{point}</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => handleInputChange(field, idx, e.target.value)}
                      className="flex-1 bg-black border border-dark-border rounded-sm px-2 py-1 text-[11px] text-white focus:border-gold outline-none"
                    />
                    <button
                      onClick={() => handleRemovePoint(field, idx)}
                      className="text-gray-500 hover:text-red-500 p-0.5 shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-dark-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            Business Model Canvas
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Map out key partners, channels, propositions, cost frameworks, and revenue lines.
          </p>
        </div>
        
        {activeStartup && !loading && rawCanvas && (
          <div className="flex items-center gap-3">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 rounded-custom border border-dark-border hover:border-gold/50 bg-dark-card hover:bg-dark-border text-white text-xs px-4 py-2 transition-colors cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Canvas
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-4 py-2 transition-colors cursor-pointer"
              >
                {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Canvas
              </button>
            )}
            
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 rounded-custom border border-dark-border hover:border-gold/50 bg-dark-card hover:bg-dark-border text-gray-400 hover:text-white text-xs px-4 py-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </button>
          </div>
        )}

        {activeStartup && !rawCanvas && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 rounded-custom bg-gold hover:bg-gold-hover disabled:bg-dark-border text-black disabled:text-gray-500 font-semibold text-xs px-4 py-2 transition-colors cursor-pointer"
          >
            {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Generate Canvas'}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {!rawCanvas && !loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-12 text-center">
          <Sparkles className="h-10 w-10 text-gold/40 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">No Canvas Formulated</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Create an interactive Business Model Canvas for <strong className="text-white font-bold">{activeStartup?.name}</strong>.
          </p>
          <button
            onClick={handleGenerate}
            className="rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer"
          >
            Run Canvas Generator (Uses 1 Credit)
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-20 text-center">
          <RefreshCw className="h-10 w-10 text-gold animate-spin mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">Formulating Lean Architecture</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Structuring revenue mechanisms, evaluating key partnerships, and identifying critical resource loops...
          </p>
        </div>
      )}

      {rawCanvas && !loading && (
        <div className="space-y-6">
          {/* 9 Box Canvas Layout */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* 1. Key Partners */}
            {renderBox('Key Partners', 'keyPartners', 'Who are our key strategic partners?', 'row-span-2', 'md:col-span-1')}

            {/* 2. Key Activities */}
            {renderBox('Key Activities', 'keyActivities', 'What key tasks does our business require?', 'row-span-1', 'md:col-span-1')}

            {/* 4. Value Propositions */}
            {renderBox('Value Propositions', 'valuePropositions', 'What unique values do we deliver?', 'row-span-2', 'md:col-span-1')}

            {/* 5. Customer Relationships */}
            {renderBox('Customer Relationships', 'customerRelationships', 'How do we interact with customers?', 'row-span-1', 'md:col-span-1')}

            {/* 7. Customer Segments */}
            {renderBox('Customer Segments', 'customerSegments', 'Who are our most important target groups?', 'row-span-2', 'md:col-span-1')}

            {/* 3. Key Resources */}
            {renderBox('Key Resources', 'keyResources', 'What core assets do we rely on?', 'row-span-1', 'md:col-span-1')}

            {/* 6. Channels */}
            {renderBox('Channels', 'channels', 'How do we reach and communicate with customers?', 'row-span-1', 'md:col-span-1')}

          </div>

          {/* Bottom Costs & Revenues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 8. Cost Structure */}
            {renderBox('Cost Structure', 'costStructure', 'What are our primary operational expenses?')}

            {/* 9. Revenue Streams */}
            {renderBox('Revenue Streams', 'revenueStreams', 'How do we monetize our value offerings?')}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useStartupStore } from '../store/startupStore';
import { useAuthStore } from '../store/authStore';
import { apiRequest } from '../utils/api';
import { RefreshCw, KanbanSquare, Calendar, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface SprintTask {
  _id?: string;
  title: string;
  column: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

export const MVPPlanner: React.FC = () => {
  const { setCredits } = useAuthStore();
  const { activeStartup, activeModules, setActiveModules } = useStartupStore();

  const [loading, setLoading] = useState(false);
  const [updatingSprint, setUpdatingSprint] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mvpData = activeModules?.mvpPlan;
  const [sprintPlan, setSprintPlan] = useState<SprintTask[]>([]);

  useEffect(() => {
    if (mvpData?.sprintPlan) {
      setSprintPlan(mvpData.sprintPlan);
    }
  }, [mvpData]);

  const handleGenerate = async () => {
    if (!activeStartup) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/ai/mvp-plan', {
        method: 'POST',
        body: { startupId: activeStartup._id },
      });

      if (res.success) {
        if (res.userCredits !== undefined) {
          setCredits(res.userCredits);
        }
        setActiveModules({
          ...activeModules,
          mvpPlan: res.mvpPlan,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const moveTask = async (taskIndex: number, direction: 'left' | 'right') => {
    const updated = [...sprintPlan];
    const task = updated[taskIndex];
    
    const columns: ('todo' | 'in_progress' | 'done')[] = ['todo', 'in_progress', 'done'];
    const currentIdx = columns.indexOf(task.column);
    
    let nextIdx = currentIdx;
    if (direction === 'left' && currentIdx > 0) nextIdx -= 1;
    if (direction === 'right' && currentIdx < 2) nextIdx += 1;
    
    if (nextIdx === currentIdx) return;
    
    task.column = columns[nextIdx];
    setSprintPlan(updated);

    // Save changes
    setUpdatingSprint(true);
    try {
      await apiRequest('/ai/mvp-plan/sprint/update', {
        method: 'POST',
        body: {
          startupId: activeStartup?._id,
          sprintPlan: updated,
        },
      });
    } catch (err) {
      console.error('Failed to sync task column change:', err);
    } finally {
      setUpdatingSprint(false);
    }
  };

  const getPriorityColor = (p: string) => {
    if (p === 'high') return 'text-red-400 border-red-950 bg-red-950/15';
    if (p === 'medium') return 'text-gold border-gold/40 bg-gold/5';
    return 'text-gray-400 border-dark-border bg-dark-card';
  };

  const getTodoTasks = () => sprintPlan.map((t, i) => ({ ...t, originalIndex: i })).filter((t) => t.column === 'todo');
  const getInProgressTasks = () => sprintPlan.map((t, i) => ({ ...t, originalIndex: i })).filter((t) => t.column === 'in_progress');
  const getDoneTasks = () => sprintPlan.map((t, i) => ({ ...t, originalIndex: i })).filter((t) => t.column === 'done');

  return (
    <div className="max-w-4xl mx-auto space-y-8 fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-dark-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <KanbanSquare className="h-5 w-5 text-gold" />
            MVP Product Planner
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Prioritize feature sets, view sprint milestones, and track execution on the Kanban board.
          </p>
        </div>
        {activeStartup && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 rounded-custom bg-gold hover:bg-gold-hover disabled:bg-dark-border text-black disabled:text-gray-500 font-semibold text-xs px-4 py-2 transition-colors cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : mvpData ? (
              'Reset Sprint Backlog'
            ) : (
              'Generate MVP Plan'
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/10 px-4 py-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {!mvpData && !loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-12 text-center">
          <KanbanSquare className="h-10 w-10 text-gold/40 mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">No MVP Product Spec</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
            Generate specifications, roadmap milestones, and Kanban items for <strong className="text-white font-bold">{activeStartup?.name}</strong>.
          </p>
          <button
            onClick={handleGenerate}
            className="rounded-custom bg-gold hover:bg-gold-hover text-black font-semibold text-xs px-5 py-2.5 transition-colors cursor-pointer"
          >
            Run MVP Planner (Uses 1 Credit)
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-custom border border-dark-border bg-dark-card p-20 text-center">
          <RefreshCw className="h-10 w-10 text-gold animate-spin mx-auto mb-4" />
          <h3 className="text-sm font-semibold text-white mb-2">Architecting Product Roadmap</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Prioritizing core database features, drafting milestone weeks, and laying out development tasks...
          </p>
        </div>
      )}

      {mvpData && !loading && (
        <div className="space-y-8">
          {/* Feature Prioritizations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              MVP Feature Scoping
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Must Haves */}
              <div className="rounded-custom border border-dark-border bg-dark-card p-5">
                <div className="text-xs font-semibold text-gold mb-3 uppercase tracking-wider font-mono">
                  Must-Have Features
                </div>
                <ul className="space-y-2">
                  {mvpData.features?.mustHave?.map((feat: string, i: number) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-gold shrink-0">•</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nice to Haves */}
              <div className="rounded-custom border border-dark-border bg-dark-card p-5">
                <div className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider font-mono">
                  Nice-to-Have Features
                </div>
                <ul className="space-y-2">
                  {mvpData.features?.niceToHave?.map((feat: string, i: number) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-gray-500 shrink-0">•</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Future Expansion */}
              <div className="rounded-custom border border-dark-border bg-dark-card p-5">
                <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider font-mono">
                  Future Expansion
                </div>
                <ul className="space-y-2">
                  {mvpData.features?.future?.map((feat: string, i: number) => (
                    <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                      <span className="text-gray-700 shrink-0">•</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Development Milestones Timeline */}
          <div className="rounded-custom border border-dark-border bg-dark-card p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gold" />
              Product Release Milestones
            </h3>
            <div className="space-y-4">
              {mvpData.milestones?.map((milestone: any, i: number) => (
                <div key={i} className="flex justify-between items-center border-b border-dark-border/40 pb-3 last:border-0 last:pb-0">
                  <div>
                    <h4 className="text-xs font-semibold text-white">{milestone.title}</h4>
                    <span className="text-[10px] text-gray-500 font-mono">{milestone.date}</span>
                  </div>
                  <span className={`text-[9px] border rounded-md px-2 py-0.5 uppercase tracking-wider font-mono ${
                    milestone.status === 'completed' ? 'text-emerald-500 border-emerald-950 bg-emerald-950/10' : 'text-gold border-gold/40 bg-gold/5'
                  }`}>
                    {milestone.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Kanban Board */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Sprint Kanban Board
              </h3>
              {updatingSprint && (
                <span className="text-[10px] text-gold font-mono flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Saving status...
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* To Do Column */}
              <div className="rounded-custom border border-dark-border bg-black/60 p-4 min-h-60 space-y-3">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono border-b border-dark-border pb-2">
                  To Do ({getTodoTasks().length})
                </div>
                {getTodoTasks().map((task) => (
                  <div key={task.originalIndex} className="rounded-md border border-dark-border bg-dark-card p-3.5 space-y-3 flex flex-col justify-between">
                    <p className="text-xs text-gray-300 leading-normal">{task.title}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className={`text-[8px] font-mono border rounded-md px-1.5 py-0.5 uppercase ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button
                        onClick={() => moveTask(task.originalIndex, 'right')}
                        className="p-1 rounded-sm hover:bg-dark-border text-gold hover:text-white transition-colors"
                        title="Move to In Progress"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* In Progress Column */}
              <div className="rounded-custom border border-dark-border bg-black/60 p-4 min-h-60 space-y-3">
                <div className="text-[10px] font-bold text-gold uppercase tracking-widest font-mono border-b border-dark-border pb-2">
                  In Progress ({getInProgressTasks().length})
                </div>
                {getInProgressTasks().map((task) => (
                  <div key={task.originalIndex} className="rounded-md border border-dark-border bg-dark-card p-3.5 space-y-3 flex flex-col justify-between">
                    <p className="text-xs text-gray-300 leading-normal">{task.title}</p>
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => moveTask(task.originalIndex, 'left')}
                        className="p-1 rounded-sm hover:bg-dark-border text-gold hover:text-white transition-colors"
                        title="Move to To Do"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <span className={`text-[8px] font-mono border rounded-md px-1.5 py-0.5 uppercase ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <button
                        onClick={() => moveTask(task.originalIndex, 'right')}
                        className="p-1 rounded-sm hover:bg-dark-border text-gold hover:text-white transition-colors"
                        title="Move to Done"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Done Column */}
              <div className="rounded-custom border border-dark-border bg-black/60 p-4 min-h-60 space-y-3">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono border-b border-dark-border pb-2 flex items-center justify-between">
                  <span>Done ({getDoneTasks().length})</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                {getDoneTasks().map((task) => (
                  <div key={task.originalIndex} className="rounded-md border border-dark-border/40 bg-dark-card/65 p-3.5 space-y-3 flex flex-col justify-between opacity-80">
                    <p className="text-xs text-gray-400 line-through leading-normal">{task.title}</p>
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={() => moveTask(task.originalIndex, 'left')}
                        className="p-1 rounded-sm hover:bg-dark-border text-gold hover:text-white transition-colors"
                        title="Move to In Progress"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <span className={`text-[8px] font-mono border border-emerald-950 bg-emerald-950/10 text-emerald-500 rounded-md px-1.5 py-0.5 uppercase`}>
                        completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

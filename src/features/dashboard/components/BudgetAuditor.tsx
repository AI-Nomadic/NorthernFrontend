import React from 'react';
import { DollarSign, Minus, Plus } from 'lucide-react';
import { cn } from '@utils';
import { useAppDispatch } from '../../../state';
import { setBudget } from '../../../state/slices/dashboardSlice';

interface BudgetAuditorProps {
    totalCost: number;
    budget: number;
}

const STEP = 100; // adjust budget by $100 per click

export const BudgetAuditor: React.FC<BudgetAuditorProps> = ({ totalCost, budget }) => {
    const dispatch = useAppDispatch();
    const percentage   = Math.round((totalCost / budget) * 100);
    const isOverBudget = totalCost > budget;
    const remaining    = budget - totalCost;
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleDecrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setBudget(budget - STEP));
    };

    const handleIncrease = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(setBudget(budget + STEP));
    };

    return (
        <div
            className="absolute top-[88px] left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ease-in-out"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div
                className={cn(
                    "bg-white/95 dark:bg-[#000000] backdrop-blur-md shadow-md border border-slate-200/60 dark:border-white/10 transition-all duration-300 overflow-hidden cursor-default hover:shadow-lg hover:shadow-primary/5",
                    isExpanded ? "rounded-2xl p-4 w-80" : "rounded-full p-1 w-32 hover:w-40"
                )}
            >
                {/* Progress Bar (always visible) */}
                <div className={cn("flex flex-col gap-2", !isExpanded && "justify-center h-2")}>
                    <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-700 ease-out",
                                isOverBudget
                                    ? "bg-gradient-to-r from-red-500 to-rose-600"
                                    : "bg-gradient-to-r from-emerald-400 to-emerald-600"
                            )}
                            style={{
                                width: `${Math.min(100, percentage)}%`,
                                boxShadow: isOverBudget
                                    ? '0 0 6px rgba(239,68,68,0.5)'
                                    : '0 0 6px rgba(16,185,129,0.4)'
                            }}
                        />
                    </div>
                </div>

                {/* Expanded Details */}
                <div className={cn(
                    "transition-all duration-300 space-y-3",
                    isExpanded ? "opacity-100 max-h-60 mt-3" : "opacity-0 max-h-0 overflow-hidden mt-0"
                )}>
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                            Budget Tracker
                        </h3>
                        <span className={cn(
                            "text-sm font-black tabular-nums",
                            isOverBudget ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"
                        )}>
                            {percentage}%
                        </span>
                    </div>

                    {/* Spent / Goal row */}
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <div className="flex flex-col">
                            <span className="text-[9px]">Spent</span>
                            <span className="text-slate-600 dark:text-slate-300">${totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px]">Remaining</span>
                            <span className={cn(
                                "font-black",
                                isOverBudget ? "text-red-400" : "text-emerald-500"
                            )}>
                                {isOverBudget ? '-' : '+'}${Math.abs(remaining).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* ── Budget Adjuster ── */}
                    <div className="pt-1 border-t border-slate-100 dark:border-white/8">
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                            Adjust Goal
                        </p>
                        <div className="flex items-center gap-2">
                            {/* Decrease */}
                            <button
                                onClick={handleDecrease}
                                disabled={budget <= 100}
                                className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/8 hover:bg-red-50 dark:hover:bg-red-500/15 hover:text-red-500 text-slate-500 dark:text-slate-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                                title="-$100"
                            >
                                <Minus className="w-3.5 h-3.5" />
                            </button>

                            {/* Budget display */}
                            <div className="flex-1 text-center bg-slate-50 dark:bg-white/5 rounded-lg py-1.5 px-2 border border-slate-200/60 dark:border-white/8">
                                <span className="text-sm font-black text-slate-700 dark:text-white tabular-nums">
                                    ${budget.toLocaleString()}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 ml-1 uppercase tracking-wide">CAD</span>
                            </div>

                            {/* Increase */}
                            <button
                                onClick={handleIncrease}
                                className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/8 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 hover:text-emerald-500 text-slate-500 dark:text-slate-400 transition-all shrink-0"
                                title="+$100"
                            >
                                <Plus className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Quick presets */}
                        <div className="flex gap-1 mt-2">
                            {[500, 1000, 2000, 5000].map(preset => (
                                <button
                                    key={preset}
                                    onClick={(e) => { e.stopPropagation(); dispatch(setBudget(preset)); }}
                                    className={cn(
                                        "flex-1 text-[9px] font-bold py-1 rounded-md transition-all uppercase tracking-wide",
                                        budget === preset
                                            ? "text-white"
                                            : "bg-slate-100 dark:bg-white/6 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/12"
                                    )}
                                    style={budget === preset ? {
                                        background: 'linear-gradient(135deg, #da09de, #8b5cf6)'
                                    } : {}}
                                >
                                    ${preset >= 1000 ? `${preset / 1000}k` : preset}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

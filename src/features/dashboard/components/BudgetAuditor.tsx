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
                        <div className="flex items-center gap-3">
                            {/* Decrease */}
                            <button
                                onClick={handleDecrease}
                                disabled={budget <= 100}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 shadow-sm"
                                title="-$100"
                            >
                                <Minus className="w-4 h-4" />
                            </button>

                            {/* Budget display */}
                            <div className="flex-1 text-center bg-slate-50 dark:bg-white/5 rounded-xl py-2 px-3 border border-slate-200 dark:border-white/10 shadow-inner">
                                <span className="text-base font-black text-slate-800 dark:text-white tabular-nums tracking-tight">
                                    ${budget.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1.5 uppercase tracking-widest">CAD</span>
                            </div>

                            {/* Increase */}
                            <button
                                onClick={handleIncrease}
                                className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all shrink-0 shadow-sm"
                                title="+$100"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quick presets */}
                        <div className="flex gap-2 mt-4">
                            {[500, 1000, 2000, 5000].map(preset => (
                                <button
                                    key={preset}
                                    onClick={(e) => { e.stopPropagation(); dispatch(setBudget(preset)); }}
                                    className={cn(
                                        "flex-1 text-[10px] font-bold py-1.5 rounded-full transition-all uppercase tracking-wide border",
                                        budget === preset
                                            ? "bg-emerald-500 text-white border-emerald-500 shadow-md scale-105"
                                            : "bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/5"
                                    )}
                                >
                                    ${preset >= 1000 ? `${preset / 1000}K` : preset}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

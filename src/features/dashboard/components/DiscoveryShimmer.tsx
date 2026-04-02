import React from 'react';

export const DiscoveryShimmer: React.FC = () => {
    return (
        <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white dark:bg-surface-a10 p-4 rounded-2xl border border-slate-100 dark:border-surface-a20 animate-pulse shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-surface-a30 rounded-lg" />
                        <div className="h-6 w-6 bg-slate-100 dark:bg-surface-a30 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-slate-100 dark:bg-surface-a20 rounded-md" />
                        <div className="h-3 w-5/6 bg-slate-50 dark:bg-surface-a20 rounded-md" />
                    </div>
                    <div className="mt-4 flex gap-2">
                        <div className="h-5 w-16 bg-slate-100 dark:bg-surface-a20 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};

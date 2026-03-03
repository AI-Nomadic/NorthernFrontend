import React, { useState, useRef } from 'react';
import { UserMinus, Users, X } from 'lucide-react';
import { Collaborator } from '../../../types/trip';
import { useClickOutside } from '../../../hooks/useClickOutside';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';

interface CollaboratorGroupProps {
    collaborators: Collaborator[];
    ownerEmail?: string;
    isOwner: boolean;
    onRemove: (email: string) => Promise<boolean>;
    onRevoke?: (email: string) => Promise<boolean>;
}

type MemberEntry = {
    email: string;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
    status: 'ACCEPTED' | 'PENDING' | 'DECLINED';
    isOwnerEntry: boolean;
};

export const CollaboratorGroup: React.FC<CollaboratorGroupProps> = ({
    collaborators,
    ownerEmail,
    isOwner,
    onRemove,
    onRevoke
}) => {
    const [activePopover, setActivePopover] = useState<string | 'overflow' | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const currentUserEmail = useSelector((state: RootState) => state.user.email);

    useClickOutside(popoverRef, () => setActivePopover(null));

    // For non-owners, only show ACCEPTED collaborators. Owners see everyone.
    const filteredCollaborators = isOwner
        ? collaborators
        : collaborators.filter(c => c.status === 'ACCEPTED');

    // Build unified member list: owner always first, then collaborators.
    // The owner's email lives in ownerEmail, NOT inside the collaborators array.
    const allMembers: MemberEntry[] = [
        ...(ownerEmail
            ? [{ email: ownerEmail, role: 'OWNER' as const, status: 'ACCEPTED' as const, isOwnerEntry: true }]
            : []
        ),
        ...filteredCollaborators.map(c => ({
            email: c.email,
            role: c.role,
            status: c.status,
            isOwnerEntry: false,
        })),
    ];

    // Colors for non-owner avatars
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    const getColor = (email: string) => colors[email.length % colors.length];

    const displayLimit = 3;
    const displayedMembers = allMembers.slice(0, displayLimit);
    const overflowMembers = allMembers.slice(displayLimit);
    const hasOverflow = overflowMembers.length > 0;

    const handleAction = async (member: MemberEntry) => {
        if (member.isOwnerEntry) return;
        const collab = collaborators.find(c => c.email === member.email);
        if (!collab) return;

        if (collab.status === 'PENDING') {
            if (onRevoke) {
                await onRevoke(collab.email);
            } else {
                await onRemove(collab.email);
            }
        } else {
            await onRemove(collab.email);
        }
        setActivePopover(null);
    };

    const getLabel = (member: MemberEntry) => {
        if (member.isOwnerEntry) return 'Creator';
        if (member.status === 'ACCEPTED') return 'Editor';
        return 'Pending';
    };

    // Show action button only for actual collaborators:
    //   - The trip owner can remove/revoke any collaborator
    //   - A collaborator can leave (their own entry)
    const showActionButton = (member: MemberEntry) => {
        if (member.isOwnerEntry) return false;
        return (isOwner && !member.isOwnerEntry) || member.email === currentUserEmail;
    };

    const renderActionButton = (member: MemberEntry, compact: boolean) => {
        const collab = collaborators.find(c => c.email === member.email);
        if (!collab) return null;
        const isPending = collab.status === 'PENDING';

        return (
            <button
                onClick={() => handleAction(member)}
                className={`flex items-center justify-center gap-2 px-2 ${compact ? 'py-1' : 'py-1.5'} text-[10px] font-bold text-white bg-red-500 hover:bg-red-600 ${compact ? 'rounded-md' : 'rounded-lg'} transition-colors shadow-sm shadow-red-500/20`}
            >
                {isPending ? (
                    <>
                        <X className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
                        Revoke
                    </>
                ) : (
                    <>
                        <UserMinus className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
                        {member.email === currentUserEmail
                            ? (compact ? 'Leave' : 'Leave Trip')
                            : 'Remove'}
                    </>
                )}
            </button>
        );
    };

    return (
        <div className="flex -space-x-2 items-center relative">
            {displayedMembers.map((member) => (
                <div key={member.email} className="relative">
                    <div
                        onClick={() => setActivePopover(member.email)}
                        className={`inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#050505] ${member.isOwnerEntry ? 'bg-violet-600' : getColor(member.email)
                            } flex items-center justify-center text-xs text-white font-bold cursor-pointer hover:z-20 transition-all hover:scale-110 shadow-sm`}
                        title={`${member.email}${member.isOwnerEntry ? ' (Creator)' : ''}`}
                    >
                        {(member.email[0] || '?').toUpperCase()}
                    </div>

                    {activePopover === member.email && (
                        <div
                            ref={popoverRef}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-surface-a10 rounded-xl shadow-xl border border-slate-100 dark:border-surface-a20 p-3 z-50 animate-in fade-in zoom-in-95"
                        >
                            <div className="flex flex-col gap-1 mb-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{member.email}</span>
                                <span className="text-[10px] text-slate-400 font-medium capitalize">
                                    {getLabel(member)}
                                </span>
                            </div>
                            {showActionButton(member) && renderActionButton(member, false)}
                        </div>
                    )}
                </div>
            ))}

            {hasOverflow && (
                <div className="relative">
                    <div
                        onClick={() => setActivePopover('overflow')}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#050505] bg-slate-100 dark:bg-surface-a20 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-surface-a30 cursor-pointer transition-all hover:z-20 hover:scale-110 shadow-sm"
                    >
                        +{overflowMembers.length}
                    </div>

                    {activePopover === 'overflow' && (
                        <div
                            ref={popoverRef}
                            className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-surface-a10 rounded-xl shadow-xl border border-slate-100 dark:border-surface-a20 p-3 z-50 animate-in fade-in zoom-in-95"
                        >
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50 dark:border-surface-a20">
                                <Users className="w-4 h-4 text-purple-500" />
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">All Members</h4>
                            </div>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                {allMembers.map((member) => (
                                    <div key={member.email} className="flex items-center justify-between group">
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate">{member.email}</span>
                                            <span className="text-[9px] text-slate-400 font-medium">{getLabel(member)}</span>
                                        </div>
                                        {showActionButton(member) && renderActionButton(member, true)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

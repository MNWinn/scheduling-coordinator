'use client';

import { useState } from 'react';
import { CalendarPlus, Check, Loader2 } from 'lucide-react';
import { addToSchedule, removeFromSchedule } from '@/app/actions/schedule';

type AddToScheduleButtonProps = {
    activityId: string;
    isInSchedule?: boolean;
    userId?: string;
};

export default function AddToScheduleButton({
    activityId,
    isInSchedule = false,
    userId = 'demo-user-123' // Default for demo
}: AddToScheduleButtonProps) {
    const [inSchedule, setInSchedule] = useState(isInSchedule);
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);

        try {
            if (inSchedule) {
                await removeFromSchedule(userId, activityId);
                setInSchedule(false);
            } else {
                await addToSchedule(userId, activityId);
                setInSchedule(true);
            }
        } catch (error) {
            console.error('Schedule action failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${inSchedule
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : inSchedule ? (
                <Check className="h-4 w-4" />
            ) : (
                <CalendarPlus className="h-4 w-4" />
            )}
            {inSchedule ? 'In Schedule' : 'Add to Schedule'}
        </button>
    );
}

'use client';

import { Suspense } from 'react';
import ActivityCard from './ActivityCard';

type ActivityFeedProps = {
    activities: any[]; // Ideally use Prisma type
};

export default function ActivityFeed({ activities }: ActivityFeedProps) {
    if (!activities || activities.length === 0) {
        return (
            <div className="flex h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50 p-8 text-center animate-in fade-in-50">
                <h3 className="text-lg font-semibold text-foreground">No activities found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your filters or search query.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
            ))}
        </div>
    );
}

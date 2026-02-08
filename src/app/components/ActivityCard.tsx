'use client';

import Link from 'next/link';
import { Calendar, MapPin, DollarSign, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Placeholder, we'll use raw tailwind or shadcn later
import AddToScheduleButton from './AddToScheduleButton';

// Helper for currency formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

// Helper for age string
const formatAge = (minMo: number | null, maxMo: number | null) => {
    if (!minMo && !maxMo) return 'All Ages';
    const minYears = minMo ? Math.floor(minMo / 12) : 0;
    const maxYears = maxMo ? Math.ceil(maxMo / 12) : 99;
    return `${minYears}-${maxYears} yrs`;
};

type ActivityProps = {
    activity: {
        id: string;
        title: string;
        imageUrl: string | null;
        price: number | null;
        minAgeMo: number | null;
        maxAgeMo: number | null;
        startDate: Date | null;
        location: {
            name: string | null;
            city: string | null;
        } | null;
    };
    isInSchedule?: boolean;
};

export default function ActivityCard({ activity, isInSchedule = false }: ActivityProps) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
            {/* Image */}
            <div className="aspect-video w-full overflow-hidden bg-muted">
                {activity.imageUrl ? (
                    <img
                        src={activity.imageUrl}
                        alt={activity.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-secondary-foreground">
                        <span className="font-semibold">No Image</span>
                    </div>
                )}

                {/* Overlay Badge */}
                <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                        {formatAge(activity.minAgeMo, activity.maxAgeMo)}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-foreground/90">
                    {activity.title}
                </h3>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {/* Date */}
                    <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 opacity-70" />
                        <span>
                            {activity.startDate
                                ? new Date(activity.startDate).toLocaleDateString()
                                : 'Ongoing'}
                        </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 opacity-70" />
                        <span className="truncate">
                            {activity.location?.name || activity.location?.city || 'Unknown Location'}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-auto flex flex-col gap-3 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center font-medium text-foreground">
                            {activity.price !== null ? formatCurrency(Number(activity.price)) : 'Free'}
                        </div>
                        <Link
                            href={`/activities/${activity.id}`}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
                        >
                            Details
                        </Link>
                    </div>
                    <AddToScheduleButton activityId={activity.id} isInSchedule={isInSchedule} />
                </div>
            </div>
        </div>
    );
}

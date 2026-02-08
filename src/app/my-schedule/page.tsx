
import { getMySchedule } from '../actions/schedule';
import Link from 'next/link';
import { Calendar, Clock, MapPin, AlertTriangle, Check, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// For now, we'll use a mock userId until auth is configured
const MOCK_USER_ID = 'demo-user-123';

export default async function MySchedulePage() {
    const { activities, conflicts } = await getMySchedule(MOCK_USER_ID);

    // Get set of conflicting activity IDs
    const conflictingIds = new Set(conflicts.flat());

    // Group activities by status
    const tentative = activities.filter(s => s.status === 'TENTATIVE');
    const confirmed = activities.filter(s => s.status === 'CONFIRMED');

    return (
        <div className="container max-w-screen-xl px-4 md:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        My Schedule
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {activities.length} activities selected
                    </p>
                </div>

                {activities.length > 0 && (
                    <a
                        href={`/api/schedule/export?userId=${MOCK_USER_ID}`}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        <Download className="h-4 w-4" />
                        Export to Calendar
                    </a>
                )}
            </div>

            {/* Conflict Warning */}
            {conflicts.length > 0 && (
                <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">
                            {conflicts.length} scheduling conflict{conflicts.length > 1 ? 's' : ''} detected
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                        Some activities have overlapping dates. Review and adjust your selections.
                    </p>
                </div>
            )}

            {activities.length === 0 ? (
                <div className="rounded-lg border border-dashed p-12 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h2 className="mt-4 text-lg font-medium">No activities selected</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Browse activities and click "Add to Schedule" to start building your plan.
                    </p>
                    <Link
                        href="/"
                        className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                        Browse Activities
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Confirmed Section */}
                    {confirmed.length > 0 && (
                        <div>
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Check className="h-5 w-5 text-green-600" />
                                Confirmed ({confirmed.length})
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {confirmed.map(({ activity, id }) => (
                                    <ScheduleCard
                                        key={id}
                                        activity={activity}
                                        hasConflict={conflictingIds.has(activity.id)}
                                        status="CONFIRMED"
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tentative Section */}
                    {tentative.length > 0 && (
                        <div>
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                Tentative ({tentative.length})
                            </h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {tentative.map(({ activity, id }) => (
                                    <ScheduleCard
                                        key={id}
                                        activity={activity}
                                        hasConflict={conflictingIds.has(activity.id)}
                                        status="TENTATIVE"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ScheduleCard({
    activity,
    hasConflict,
    status
}: {
    activity: any;
    hasConflict: boolean;
    status: 'TENTATIVE' | 'CONFIRMED';
}) {
    const formatDate = (date: Date | null) => {
        if (!date) return 'TBD';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className={`relative rounded-lg border p-4 transition-shadow hover:shadow-md ${hasConflict ? 'border-yellow-300 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-900/10' : ''
            }`}>
            {hasConflict && (
                <div className="absolute -top-2 -right-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-yellow-900">
                        <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                </div>
            )}

            <div className="flex items-start justify-between gap-2">
                <Link href={`/activities/${activity.id}`} className="hover:underline">
                    <h3 className="font-medium line-clamp-2">{activity.title}</h3>
                </Link>
                <Badge variant={status === 'CONFIRMED' ? 'default' : 'secondary'}>
                    {status.toLowerCase()}
                </Badge>
            </div>

            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(activity.startDate)} - {formatDate(activity.endDate)}</span>
                </div>
                {activity.location && (
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{activity.location.name || activity.location.address}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold text-primary">
                    ${activity.price?.toFixed(2) || 'Free'}
                </span>
            </div>
        </div>
    );
}

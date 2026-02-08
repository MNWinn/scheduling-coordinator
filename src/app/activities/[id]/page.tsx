
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, DollarSign, Clock, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const prisma = new PrismaClient();

// Force dynamic rendering as we might want real-time status updates later
export const dynamic = 'force-dynamic';

async function getActivity(id: string) {
    const activity = await prisma.activity.findUnique({
        where: { id },
        include: {
            location: true,
            provider: true,
        },
    });
    return activity;
}

// Helper for age string
const formatAge = (minMo: number | null, maxMo: number | null) => {
    if (!minMo && !maxMo) return 'All Ages';
    const min = minMo ? minMo / 12 : 0;
    const max = maxMo ? maxMo / 12 : 99;
    return `${min}-${max} years old`;
};

// Helper for schedule
const formatSchedule = (json: any) => {
    if (!json || typeof json !== 'object') return 'See details';
    // simplistic
    const days = json.raw_days || json.days || '';
    const times = json.raw_times || json.times || '';
    return `${days} ${times}`;
};

export default async function ActivityPage({ params }: { params: { id: string } }) {
    const activity = await getActivity(params.id);

    if (!activity) {
        notFound();
    }

    return (
        <div className="container max-w-4xl py-10 px-4 md:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">{activity.title}</h1>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-sm">
                            {formatAge(activity.minAgeMo, activity.maxAgeMo)}
                        </Badge>
                        {activity.category && (
                            <Badge variant="outline" className="text-sm">
                                {activity.category}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                {/* Main Content */}
                <div className="space-y-8">
                    {/* Image */}
                    <div className="overflow-hidden rounded-xl border bg-muted shadow-sm aspect-video">
                        {activity.imageUrl ? (
                            <img
                                src={activity.imageUrl}
                                alt={activity.title}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                No Image Available
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <section className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Info className="h-5 w-5 text-primary" />
                            About this Activity
                        </h3>
                        <div className="prose max-w-none text-muted-foreground">
                            <p>{activity.description || "No description provided."}</p>
                        </div>
                    </section>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">

                        {/* Price */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Price</p>
                                <p className="text-lg font-bold">
                                    {activity.price ? `$${Number(activity.price).toFixed(2)}` : 'Free'}
                                </p>
                            </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Dates</p>
                                <p className="font-medium">
                                    {activity.startDate ? new Date(activity.startDate).toLocaleDateString() : 'Ongoing'}
                                    {' - '}
                                    {activity.endDate ? new Date(activity.endDate).toLocaleDateString() : ''}
                                </p>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Schedule</p>
                                <p className="font-medium">
                                    {formatSchedule(activity.schedule)}
                                </p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Location</p>
                                <p className="font-medium">
                                    {activity.location?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {activity.location?.address}, {activity.location?.city}
                                </p>
                            </div>
                        </div>

                        <div className="pt-4">
                            {activity.sourceUrl ? (
                                <a
                                    href={activity.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                >
                                    Register on Provider Site
                                </a>
                            ) : (
                                <button disabled className="w-full rounded-md bg-muted py-2 text-sm font-medium text-muted-foreground">
                                    Registration Closed
                                </button>
                            )}
                        </div>

                    </div>

                    {/* Provider Info */}
                    <div className="rounded-xl border bg-card p-6 shadow-sm">
                        <h4 className="font-semibold mb-2">Provider</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                            {activity.provider.name}
                        </p>
                        {activity.provider.isVerified && (
                            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                <CheckCircle className="h-3 w-3" />
                                Verified Provider
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

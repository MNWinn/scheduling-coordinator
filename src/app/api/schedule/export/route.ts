
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateICS } from '@/lib/ics';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    try {
        // Fetch user's confirmed activities (or all if none confirmed)
        const selections = await prisma.selectedActivity.findMany({
            where: { userId },
            include: {
                activity: {
                    include: { location: true }
                }
            }
        });

        if (selections.length === 0) {
            return NextResponse.json({ error: 'No activities in schedule' }, { status: 404 });
        }

        // Convert to ICS format
        const events = selections
            .filter(s => s.activity.startDate && s.activity.endDate)
            .map(s => ({
                id: s.activity.id,
                title: s.activity.title,
                description: s.activity.description || undefined,
                location: s.activity.location?.name || s.activity.location?.address || undefined,
                startDate: new Date(s.activity.startDate!),
                endDate: new Date(s.activity.endDate!),
            }));

        const icsContent = generateICS(events);

        // Return as downloadable file
        return new NextResponse(icsContent, {
            headers: {
                'Content-Type': 'text/calendar',
                'Content-Disposition': 'attachment; filename="my-schedule.ics"',
            },
        });
    } catch (error) {
        console.error('Error exporting schedule:', error);
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}

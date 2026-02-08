'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// Add activity to user's schedule
export async function addToSchedule(userId: string, activityId: string) {
    if (!userId) {
        return { error: 'User not authenticated' };
    }

    try {
        await prisma.selectedActivity.upsert({
            where: {
                userId_activityId: { userId, activityId }
            },
            update: {},
            create: {
                userId,
                activityId,
                status: 'TENTATIVE',
            }
        });

        revalidatePath('/my-schedule');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error adding to schedule:', error);
        return { error: 'Failed to add to schedule' };
    }
}

// Remove activity from user's schedule
export async function removeFromSchedule(userId: string, activityId: string) {
    if (!userId) {
        return { error: 'User not authenticated' };
    }

    try {
        await prisma.selectedActivity.deleteMany({
            where: { userId, activityId }
        });

        revalidatePath('/my-schedule');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error removing from schedule:', error);
        return { error: 'Failed to remove from schedule' };
    }
}

// Update activity status (TENTATIVE -> CONFIRMED)
export async function updateScheduleStatus(
    userId: string,
    activityId: string,
    status: 'TENTATIVE' | 'CONFIRMED'
) {
    if (!userId) {
        return { error: 'User not authenticated' };
    }

    try {
        await prisma.selectedActivity.update({
            where: {
                userId_activityId: { userId, activityId }
            },
            data: { status }
        });

        revalidatePath('/my-schedule');
        return { success: true };
    } catch (error) {
        console.error('Error updating status:', error);
        return { error: 'Failed to update status' };
    }
}

// Get user's schedule with activities
export async function getMySchedule(userId: string) {
    if (!userId) {
        return { activities: [], conflicts: [] };
    }

    try {
        const selections = await prisma.selectedActivity.findMany({
            where: { userId },
            include: {
                activity: {
                    include: {
                        location: true,
                        provider: true,
                    }
                }
            },
            orderBy: { activity: { startDate: 'asc' } }
        });

        // Detect conflicts (overlapping time slots)
        const conflicts: string[][] = [];
        for (let i = 0; i < selections.length; i++) {
            for (let j = i + 1; j < selections.length; j++) {
                const a = selections[i].activity;
                const b = selections[j].activity;

                if (a.startDate && b.startDate && a.endDate && b.endDate) {
                    // Check if date ranges overlap
                    const aStart = new Date(a.startDate).getTime();
                    const aEnd = new Date(a.endDate).getTime();
                    const bStart = new Date(b.startDate).getTime();
                    const bEnd = new Date(b.endDate).getTime();

                    if (aStart <= bEnd && bStart <= aEnd) {
                        conflicts.push([a.id, b.id]);
                    }
                }
            }
        }

        return {
            activities: selections,
            conflicts
        };
    } catch (error) {
        console.error('Error fetching schedule:', error);
        return { activities: [], conflicts: [] };
    }
}

// Check if activity is in user's schedule
export async function isInSchedule(userId: string, activityId: string) {
    if (!userId) return false;

    try {
        const selection = await prisma.selectedActivity.findUnique({
            where: {
                userId_activityId: { userId, activityId }
            }
        });
        return !!selection;
    } catch (error) {
        return false;
    }
}

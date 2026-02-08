'use server';

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export type GetActivitiesParams = {
    query?: string;
    minAge?: number;
    maxAge?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    useSemanticSearch?: boolean;
};

async function getQueryEmbedding(text: string): Promise<number[] | null> {
    if (!openai) return null;

    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
    }
}

export async function getActivities(params: GetActivitiesParams) {
    const {
        query,
        minAge,
        maxAge,
        startDate,
        endDate,
        page = 1,
        limit = 12,
        useSemanticSearch = false,
    } = params;

    const skip = (page - 1) * limit;

    // If semantic search is enabled and we have a meaningful query
    if (useSemanticSearch && query && query.length >= 3 && openai) {
        try {
            const queryEmbedding = await getQueryEmbedding(query);

            if (queryEmbedding) {
                // Build additional WHERE conditions for filters
                const whereConditions: string[] = ['a.embedding IS NOT NULL'];

                if (minAge !== undefined) {
                    whereConditions.push(`a."maxAgeMo" >= ${minAge * 12}`);
                }
                if (maxAge !== undefined) {
                    whereConditions.push(`a."minAgeMo" <= ${maxAge * 12}`);
                }
                if (startDate) {
                    whereConditions.push(`a."startDate" >= '${startDate}'::date`);
                }
                if (endDate) {
                    whereConditions.push(`a."endDate" <= '${endDate}'::date`);
                }

                const whereClause = whereConditions.join(' AND ');

                // Semantic search with vector similarity
                const activities: any[] = await prisma.$queryRawUnsafe(`
                    SELECT 
                        a.id, 
                        a.title, 
                        a.description, 
                        a.price, 
                        a."minAgeMo", 
                        a."maxAgeMo",
                        a."startDate",
                        a."endDate",
                        a."imageUrl",
                        a.category,
                        json_build_object(
                            'id', l.id,
                            'name', l.name,
                            'city', l.city,
                            'lat', l.lat,
                            'lng', l.lng
                        ) as location,
                        1 - (a.embedding <=> $1::vector) as similarity
                    FROM "Activity" a
                    LEFT JOIN "Location" l ON a."locationId" = l.id
                    WHERE ${whereClause}
                    ORDER BY a.embedding <=> $1::vector
                    LIMIT $2 OFFSET $3
                `, JSON.stringify(queryEmbedding), limit, skip);

                // Get total count for pagination
                const countResult: any[] = await prisma.$queryRawUnsafe(`
                    SELECT COUNT(*) as count
                    FROM "Activity" a
                    WHERE ${whereClause}
                `);

                const totalCount = Number(countResult[0]?.count || 0);

                return {
                    activities,
                    totalCount,
                    totalPages: Math.ceil(totalCount / limit),
                    searchType: 'semantic'
                };
            }
        } catch (error) {
            console.error('Semantic search error, falling back to keyword:', error);
            // Fall through to keyword search
        }
    }

    // Keyword search fallback
    const where: any = {};

    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
        ];
    }

    if (minAge !== undefined) {
        where.maxAgeMo = { gte: minAge * 12 };
    }
    if (maxAge !== undefined) {
        where.minAgeMo = { lte: maxAge * 12 };
    }

    if (startDate) {
        where.startDate = { gte: new Date(startDate) };
    }
    if (endDate) {
        where.endDate = { lte: new Date(endDate) };
    }

    where.price = { not: null };

    try {
        const [activities, totalCount] = await Promise.all([
            prisma.activity.findMany({
                where,
                include: {
                    location: true,
                    provider: true,
                },
                skip,
                take: limit,
                orderBy: { startDate: 'asc' },
            }),
            prisma.activity.count({ where }),
        ]);

        return {
            activities,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            searchType: 'keyword'
        };
    } catch (error) {
        console.error('Error fetching activities:', error);
        return { activities: [], totalCount: 0, totalPages: 0, searchType: 'error' };
    }
}

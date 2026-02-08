import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get('q');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '12');

    if (!query || query.length < 3) {
        return NextResponse.json({ error: 'Query too short' }, { status: 400 });
    }

    try {
        // Generate embedding for the search query
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query,
        });

        const queryEmbedding = embeddingResponse.data[0].embedding;

        // Perform vector similarity search using raw SQL
        // Using cosine distance operator <=> from pgvector
        const results = await prisma.$queryRaw`
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
                l.name as "locationName",
                l.city,
                l.lat,
                l.lng,
                1 - (a.embedding <=> ${queryEmbedding}::vector) as similarity
            FROM "Activity" a
            LEFT JOIN "Location" l ON a."locationId" = l.id
            WHERE a.embedding IS NOT NULL
            ORDER BY a.embedding <=> ${queryEmbedding}::vector
            LIMIT ${limit}
        `;

        return NextResponse.json({
            activities: results,
            query
        });
    } catch (error) {
        console.error('Semantic search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}

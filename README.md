# scheduling-coordinator

## Children's Activity Portal MVP

A centralized searchable portal for children's activities, featuring interactive maps, personal scheduling with conflict detection, and AI-powered semantic search.

### Features
- **Interactive Map**: Discover activities near you using OpenStreetMap and Leaflet.
- **My Schedule**: Build a personalized itinerary of activities.
- **Conflict Detection**: Automated warnings for overlapping activity schedules.
- **Semantic Search**: Natural language search powered by OpenAI embeddings and pgvector.
- **ICS Export**: Export your schedule to external calendar applications.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Supabase) + pgvector
- **Search**: OpenAI Embeddings API
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **ORM**: Prisma

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables in `.env`:
   - `DATABASE_URL`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Push the database schema:
   - `npx prisma db push`
4. Run the development server:
   ```bash
   npm run dev
   ```

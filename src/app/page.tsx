
import { getActivities } from './actions/getActivities';
import ActivityFeed from './components/ActivityFeed';
import FilterSidebar from './components/FilterSidebar';
import dynamicCommon from 'next/dynamic';
import { Map as MapIcon, List } from 'lucide-react';
import Link from 'next/link';

// Dynamically import Map to avoid SSR issues with Leaflet
const MapComponent = dynamicCommon(() => import('./components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full animate-pulse rounded-lg bg-muted" />,
});

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Home({ searchParams }: PageProps) {
  // Parse params
  const query = typeof searchParams.query === 'string' ? searchParams.query : undefined;
  const minAge = typeof searchParams.minAge === 'string' ? parseInt(searchParams.minAge) : undefined;
  const maxAge = typeof searchParams.maxAge === 'string' ? parseInt(searchParams.maxAge) : undefined;
  const startDate = typeof searchParams.startDate === 'string' ? searchParams.startDate : undefined;
  const endDate = typeof searchParams.endDate === 'string' ? searchParams.endDate : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const view = typeof searchParams.view === 'string' ? searchParams.view : 'list'; // 'list' or 'map'

  // Fetch Data - Enable semantic search for natural language queries
  const { activities, totalCount, searchType } = await getActivities({
    query,
    minAge,
    maxAge,
    startDate,
    endDate,
    page,
    limit: view === 'map' ? 100 : 12, // Load more for map view
    useSemanticSearch: true, // Enable AI-powered semantic search
  });

  return (
    <div className="container max-w-screen-2xl px-4 md:px-8 py-8">
      {/* Hero / Header Section */}
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Discover Activities
        </h1>
        <p className="text-lg text-muted-foreground">
          Find the best camps, classes, and sports for your kids in Babylon.
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <FilterSidebar />
        </aside>

        {/* Main Feed */}
        <main className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <strong>{activities.length}</strong> of <strong>{totalCount}</strong> results
            </p>

            {/* View Toggle */}
            <div className="flex items-center rounded-md border bg-muted p-1">
              <Link
                href={`/?${new URLSearchParams({ ...searchParams as any, view: 'list' }).toString()}`}
                className={`flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${view !== 'map' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
              >
                <List className="mr-2 h-4 w-4" />
                List
              </Link>
              <Link
                href={`/?${new URLSearchParams({ ...searchParams as any, view: 'map' }).toString()}`}
                className={`flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${view === 'map' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
              >
                <MapIcon className="mr-2 h-4 w-4" />
                Map
              </Link>
            </div>
          </div>

          {view === 'map' ? (
            <div className="h-[600px] w-full rounded-xl border overflow-hidden">
              <MapComponent activities={activities} />
            </div>
          ) : (
            <>
              <ActivityFeed activities={activities} />

              {/* Simple Pagination */}
              <div className="mt-8 flex justify-center gap-2">
                {page > 1 && (
                  <Link href={`/?${new URLSearchParams({ ...searchParams as any, page: (page - 1).toString() }).toString()}`} className="rounded border px-4 py-2 text-sm hover:bg-accent">
                    Previous
                  </Link>
                )}
                {activities.length === 12 && (
                  <Link href={`/?${new URLSearchParams({ ...searchParams as any, page: (page + 1).toString() }).toString()}`} className="rounded border px-4 py-2 text-sm hover:bg-accent">
                    Next
                  </Link>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce'; // You might need to install this

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for immediate UI feedback
    const [minAge, setMinAge] = useState(searchParams.get('minAge') || '');
    const [maxAge, setMaxAge] = useState(searchParams.get('maxAge') || '');
    const [query, setQuery] = useState(searchParams.get('query') || '');

    // Helper to update URL params
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    // Debounced search
    const handleSearch = useDebouncedCallback((term) => {
        router.push(`/?${createQueryString('query', term)}`, { scroll: false });
    }, 500);

    // Age Filter
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (minAge) params.set('minAge', minAge); else params.delete('minAge');
        if (maxAge) params.set('maxAge', maxAge); else params.delete('maxAge');
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="w-full space-y-6 md:w-64 md:shrink-0">
            {/* Mobile Filters Toggle (Hidden on Desktop) */}
            <div className="flex items-center justify-between md:hidden">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button className="rounded-md border p-2">
                    <SlidersHorizontal className="h-4 w-4" />
                </button>
            </div>

            <div className="hidden space-y-6 md:block">
                {/* Search Input */}
                <div className="space-y-2">
                    <label htmlFor="search" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Search
                    </label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            id="search"
                            type="text"
                            placeholder="Try: 'water activities for toddlers'"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                            defaultValue={searchParams.get('query')?.toString()}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        ✨ AI-powered semantic search is enabled
                    </p>
                </div>

                {/* Age Range */}
                <div className="space-y-4">
                    <h3 className="text-sm font-medium">Age (Years)</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            min="0"
                            max="18"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={minAge}
                            onChange={(e) => setMinAge(e.target.value)}
                        />
                        <span className="text-muted-foreground">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            min="0"
                            max="18"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={maxAge}
                            onChange={(e) => setMaxAge(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={applyFilters}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 h-8 px-3 w-full"
                    >
                        Apply Filters
                    </button>
                </div>

                {/* Categories (Static for now) */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium">Categories</h3>
                    <div className="space-y-2">
                        {['Sports', 'Arts & Crafts', 'STEM', 'Music', 'Camps'].map((cat) => (
                            <div key={cat} className="flex items-center space-x-2">
                                <input type="checkbox" id={cat} className="h-4 w-4 rounded border-primary text-primary focus:ring-primary" />
                                <label htmlFor={cat} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {cat}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

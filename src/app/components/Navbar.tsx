
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Navbar() {
    const supabase = createClient();
    const user = supabase ? (await supabase.auth.getUser()).data.user : null;

    const signOut = async () => {
        'use server'
        const supabase = createClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        redirect('/');
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b backdrop-blur-lg bg-background/80 supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">

                {/* Logo */}
                <div className="mr-8 hidden md:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            KidActivity
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Activities
                        </Link>
                        <Link href="/my-schedule" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            My Schedule
                        </Link>
                        <Link href="/camps" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            Camps
                        </Link>
                        <Link href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">
                            About
                        </Link>
                    </nav>
                </div>

                {/* Mobile Menu Button */}
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </button>

                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        {/* Search Placeholder */}
                        <button className="relative inline-flex h-9 w-full items-center justify-start whitespace-nowrap rounded-[0.5rem] border border-input bg-muted/50 px-4 py-2 text-sm font-normal text-muted-foreground shadow-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 sm:pr-12 md:w-40 lg:w-64">
                            <span className="hidden lg:inline-flex">Search activities...</span>
                            <span className="inline-flex lg:hidden">Search...</span>
                            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </button>
                    </div>

                    <nav className="flex items-center gap-2">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground hidden md:inline-block">
                                    {user.email}
                                </span>
                                <form action={signOut}>
                                    <button className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                                        Sign Out
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                            >
                                Sign In
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </nav>
    );
}

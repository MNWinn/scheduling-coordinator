
import { login, signup } from './actions'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string; error: string }
}) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-muted/30">

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                    Sign in to save your favorite activities
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-card px-4 py-8 shadow sm:rounded-lg sm:px-10 border">
                    <form className="space-y-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-foreground"
                            >
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-md border border-input py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-foreground"
                            >
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-md border border-input py-2 px-3 text-foreground shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm bg-background"
                                />
                            </div>
                        </div>

                        {searchParams?.error && (
                            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-200">
                                {searchParams.error}
                            </div>
                        )}
                        {searchParams?.message && (
                            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/50 dark:text-green-200">
                                {searchParams.message}
                            </div>
                        )}

                        <div className="flex flex-col gap-4">
                            <button
                                formAction={login}
                                className="flex w-full justify-center rounded-md border border-transparent bg-primary py-2 px-4 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                Sign in
                            </button>
                            <button
                                formAction={signup}
                                className="flex w-full justify-center rounded-md border border-input bg-background py-2 px-4 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                Sign up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

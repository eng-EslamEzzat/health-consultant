"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPatient } from "@/app/lib/api";
import Link from "next/link";

export default function NewPatientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        try {
            await createPatient({
                full_name: formData.get("full_name") as string,
                email: formData.get("email") as string,
                date_of_birth: formData.get("date_of_birth") as string,
            });
            router.push("/patients");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">New Patient</h1>
                <Link href="/patients" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    Back to list
                </Link>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl">
                <form onSubmit={onSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 mb-6">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="full_name" className="block text-sm font-medium leading-6 text-slate-900">
                                Full Name
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="full_name"
                                    id="full_name"
                                    required
                                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                    placeholder="john.doe@example.com"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-3">
                            <label htmlFor="date_of_birth" className="block text-sm font-medium leading-6 text-slate-900">
                                Date of Birth
                            </label>
                            <div className="mt-2">
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    id="date_of_birth"
                                    required
                                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-x-6 border-t border-slate-900/10 pt-6">
                        <button
                            type="button"
                            onClick={() => router.push("/patients")}
                            className="text-sm font-semibold leading-6 text-slate-900 hover:text-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Saving..." : "Save Patient"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

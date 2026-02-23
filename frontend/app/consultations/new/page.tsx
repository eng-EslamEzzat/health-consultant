"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createConsultation, fetchPatients, Patient } from "@/app/lib/api";
import Link from "next/link";

export default function NewConsultationPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingPatients, setFetchingPatients] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadPatients() {
            try {
                const data = await fetchPatients();
                setPatients(data.results);
            } catch (err) {
                setError("Failed to load patients. Please try refreshing the page.");
            } finally {
                setFetchingPatients(false);
            }
        }
        loadPatients();
    }, []);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        try {
            await createConsultation({
                patient: Number(formData.get("patient")),
                symptoms: formData.get("symptoms") as string,
                diagnosis: formData.get("diagnosis") as string,
            });
            router.push(`/consultations`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setLoading(false);
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">New Consultation</h1>
                <Link href="/consultations" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                    Back to list
                </Link>
            </div>

            <div className="bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl">
                <form onSubmit={onSubmit} className="p-8 space-y-8">
                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label htmlFor="patient" className="block text-sm font-medium leading-6 text-slate-900">
                                Select Patient
                            </label>
                            <div className="mt-2">
                                <select
                                    id="patient"
                                    name="patient"
                                    required
                                    disabled={fetchingPatients}
                                    className="block w-full rounded-md border-0 py-2.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white disabled:bg-slate-50 disabled:text-slate-500"
                                >
                                    <option value="">Select a patient</option>
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.full_name} ({p.email})
                                        </option>
                                    ))}
                                </select>
                                {patients.length === 0 && !fetchingPatients && (
                                    <p className="mt-2 text-sm text-amber-600">
                                        No patients found. <Link href="/patients/new" className="font-semibold underline">Add one first.</Link>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="symptoms" className="block text-sm font-medium leading-6 text-slate-900">
                                Symptoms
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="symptoms"
                                    name="symptoms"
                                    rows={4}
                                    required
                                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                    placeholder="Describe the patient's symptoms..."
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="diagnosis" className="block text-sm font-medium leading-6 text-slate-900">
                                Diagnosis (Optional)
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="diagnosis"
                                    name="diagnosis"
                                    rows={3}
                                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-3"
                                    placeholder="Preliminary diagnosis or notes..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-x-6 border-t border-slate-900/10 pt-6">
                        <button
                            type="button"
                            onClick={() => router.push("/consultations")}
                            className="text-sm font-semibold leading-6 text-slate-900 hover:text-slate-600 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || patients.length === 0}
                            className="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Creating..." : "Create Consultation"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

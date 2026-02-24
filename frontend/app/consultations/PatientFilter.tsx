"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Patient } from "@/app/lib/api";

export default function PatientFilter({ patients }: { patients: Patient[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPatientId = searchParams.get("patient") || "";

    function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set("patient", value);
        } else {
            params.delete("patient");
        }

        // Reset to page 1 when filter changes
        params.delete("page");

        router.push(`/consultations?${params.toString()}`);
    }

    return (
        <div className="flex items-center gap-3">
            <label htmlFor="patient-filter" className="text-sm font-medium text-slate-700 whitespace-nowrap">
                Filter by Patient:
            </label>
            <select
                id="patient-filter"
                value={currentPatientId}
                onChange={onChange}
                className="block w-full max-w-xs rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 bg-white transition-colors"
            >
                <option value="">All Patients</option>
                {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                        {patient.full_name}
                    </option>
                ))}
            </select>
        </div>
    );
}

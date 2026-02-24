import { fetchConsultations, fetchPatients } from "@/app/lib/api";
import Link from "next/link";
import ConsultationCard from "./ConsultationCard";
import Pagination from "@/app/components/Pagination";
import PatientFilter from "./PatientFilter";

const PAGE_SIZE = 9;

export default async function ConsultationsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; patient?: string }>;
}) {
    const params = await searchParams;
    const currentPage = Math.max(1, Number(params.page) || 1);
    const patientId = params.patient || "";

    // Fetch data in parallel for better performance
    const [data, patientsData] = await Promise.all([
        fetchConsultations(currentPage, patientId),
        fetchPatients(1) // We need all patients for the filter; assuming we don't have thousands for now
    ]);

    // Note: Since patients are paginated, we might need a way to get *all* patients.
    // For now, let's take the first page. For a real senior app, we'd have a non-paginated search endpoint.
    const allPatients = patientsData.results;

    const totalPages = Math.ceil(data.count / PAGE_SIZE);
    const filterParams = patientId ? `&patient=${patientId}` : "";

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">Consultations</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        A history of all patient consultations, diagnoses, and AI summaries.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                        href="/consultations/new"
                        className="block rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                    >
                        New Consultation
                    </Link>
                </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <PatientFilter patients={allPatients} />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {data.results.length === 0 ? (
                    <div className="col-span-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No consultations found</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {patientId
                                ? "No consultations for the selected patient."
                                : "Get started by creating a new consultation."}
                        </p>
                    </div>
                ) : (
                    data.results.map((consultation) => (
                        <ConsultationCard key={consultation.id} initialConsultation={consultation} />
                    ))
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/consultations"
                extraParams={filterParams}
            />
        </div>
    );
}

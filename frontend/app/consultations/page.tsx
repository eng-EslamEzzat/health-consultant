import { fetchConsultations } from "@/app/lib/api";
import Link from "next/link";
import ConsultationCard from "./ConsultationCard";
import Pagination from "@/app/components/Pagination";

const PAGE_SIZE = 10;

export default async function ConsultationsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const currentPage = Math.max(1, Number(params.page) || 1);
    const data = await fetchConsultations(currentPage);
    const totalPages = Math.ceil(data.count / PAGE_SIZE);

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

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                {data.results.length === 0 ? (
                    <div className="col-span-full border-2 border-dashed border-slate-300 rounded-xl p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-semibold text-slate-900">No consultations</h3>
                        <p className="mt-1 text-sm text-slate-500">Get started by creating a new consultation.</p>
                        <div className="mt-6">
                            <Link
                                href="/consultations/new"
                                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                <svg className="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                </svg>
                                New Consultation
                            </Link>
                        </div>
                    </div>
                ) : (
                    data.results.map((consultation) => (
                        <ConsultationCard key={consultation.id} initialConsultation={consultation} />
                    ))
                )}
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/consultations" />
        </div>
    );
}

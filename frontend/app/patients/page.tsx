import { fetchPatients } from "@/app/lib/api";
import Link from "next/link";
import Pagination from "@/app/components/Pagination";

const PAGE_SIZE = 10;

export default async function PatientsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const currentPage = Math.max(1, Number(params.page) || 1);
    const data = await fetchPatients(currentPage);
    const totalPages = Math.ceil(data.count / PAGE_SIZE);

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">Patients</h1>
                    <p className="mt-2 text-sm text-slate-600">
                        A list of all patients in your registry including their name, email, and date of birth.
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <Link
                        href="/patients/new"
                        className="block rounded-md bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                    >
                        Add Patient
                    </Link>
                </div>
            </div>

            <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-xl border border-slate-100 ring-1 ring-slate-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-slate-300">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                                            Name
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                                            Email
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                                            Date of Birth
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {data.results.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-10 text-center text-sm text-slate-500">
                                                No patients found. Add your first patient to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.results.map((patient) => (
                                            <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                                                    {patient.full_name}
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{patient.email}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{patient.date_of_birth}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/patients" />
        </div>
    );
}

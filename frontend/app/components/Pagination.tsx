import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
    extraParams?: string;
}

export default function Pagination({ currentPage, totalPages, basePath, extraParams = "" }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageUrl = (page: number) => {
        return `${basePath}?page=${page}${extraParams}`;
    };

    return (
        <nav className="flex items-center justify-between border-t border-slate-200 px-4 py-8 sm:px-0 mt-12">
            <div className="-mt-px flex w-0 flex-1">
                {currentPage > 1 && (
                    <Link
                        href={getPageUrl(currentPage - 1)}
                        className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors"
                    >
                        <svg className="mr-3 h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z" clipRule="evenodd" />
                        </svg>
                        Previous
                    </Link>
                )}
            </div>
            <div className="hidden md:-mt-px md:flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                        key={page}
                        href={getPageUrl(page)}
                        className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium transition-colors ${page === currentPage
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            }`}
                        aria-current={page === currentPage ? "page" : undefined}
                    >
                        {page}
                    </Link>
                ))}
            </div>
            <div className="-mt-px flex w-0 flex-1 justify-end">
                {currentPage < totalPages && (
                    <Link
                        href={getPageUrl(currentPage + 1)}
                        className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-colors"
                    >
                        Next
                        <svg className="ml-3 h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                        </svg>
                    </Link>
                )}
            </div>
        </nav>
    );
}

import Link from "next/link";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    if (totalPages <= 1) return null;

    // Build a window of page numbers to display
    const pages: (number | "...")[] = [];
    const delta = 1; // pages around current page

    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - delta && i <= currentPage + delta)
        ) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== "...") {
            pages.push("...");
        }
    }

    return (
        <nav className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-6 mt-6" aria-label="Pagination">
            <div className="hidden sm:block">
                <p className="text-sm text-slate-500">
                    Page <span className="font-medium text-slate-700">{currentPage}</span> of{" "}
                    <span className="font-medium text-slate-700">{totalPages}</span>
                </p>
            </div>
            <div className="flex flex-1 justify-between sm:justify-end gap-1">
                {/* Previous */}
                {currentPage > 1 ? (
                    <Link
                        href={`${basePath}?page=${currentPage - 1}`}
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        ← Previous
                    </Link>
                ) : (
                    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed">
                        ← Previous
                    </span>
                )}

                {/* Page Numbers */}
                <div className="hidden sm:flex items-center gap-1">
                    {pages.map((page, idx) =>
                        page === "..." ? (
                            <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-slate-400">
                                …
                            </span>
                        ) : page === currentPage ? (
                            <span
                                key={page}
                                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm"
                            >
                                {page}
                            </span>
                        ) : (
                            <Link
                                key={page}
                                href={`${basePath}?page=${page}`}
                                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                {page}
                            </Link>
                        )
                    )}
                </div>

                {/* Next */}
                {currentPage < totalPages ? (
                    <Link
                        href={`${basePath}?page=${currentPage + 1}`}
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Next →
                    </Link>
                ) : (
                    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed">
                        Next →
                    </span>
                )}
            </div>
        </nav>
    );
}

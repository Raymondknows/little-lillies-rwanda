interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      page === currentPage - 1 ||
      page === currentPage ||
      page === currentPage + 1,
  );

  return (
    <div className={`mt-4 flex flex-col gap-3 sm:mt-6 sm:gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="text-sm text-muted">
        Page {currentPage} of {totalPages}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded px-3 py-2 border border-border text-sm font-medium text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {pages.map((page, index) => (
          <span key={page} className="flex items-center">
            {index > 0 && pages[index - 1] !== page - 1 ? (
              <span className="px-2 text-sm text-muted">…</span>
            ) : null}
            <button
              type="button"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
              className={`rounded px-3 py-2 text-sm font-medium ${
                page === currentPage
                  ? "bg-primary text-white"
                  : "border border-border text-foreground hover:bg-background"
              }`}
            >
              {page}
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded px-3 py-2 border border-border text-sm font-medium text-foreground hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

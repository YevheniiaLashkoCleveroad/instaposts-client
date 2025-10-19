const Pagination = ({ pages, currentPage, onPageChange }) => {
    if (!pages || pages.length <= 1) return null;

    const totalPages = pages.length;

    const visiblePages = [];

    visiblePages.push(1);

    if (currentPage > 4) {
        visiblePages.push('left-dots');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
        visiblePages.push(i);
    }

    if (currentPage < totalPages - 3) {
        visiblePages.push('right-dots');
    }

    if (totalPages > 1) {
        visiblePages.push(totalPages);
    }

    const handleClick = (page) => {
        if (typeof page === 'number') {
            onPageChange(page);
        }
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center size-10 border rounded text-gray-500 border-gray-200 hover:bg-gray-100 disabled:opacity-50"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>

            {visiblePages.map((page, idx) => (
                <button
                    key={idx}
                    onClick={() => handleClick(page)}
                    disabled={typeof page !== 'number'}
                    className={`flex items-center justify-center size-10 border rounded text-gray-500 border-gray-200 ${
                        page === currentPage
                            ? 'bg-gray-200 size-10'
                            : 'hover:bg-gray-100'
                    } ${typeof page !== 'number' ? 'cursor-default opacity-60' : ''}`}
                >
                    {typeof page === 'string' ? '...' : page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center size-10 border rounded text-gray-500 border-gray-200 hover:bg-gray-100 disabled:opacity-50"
            >
                <i className="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    );
};

export default Pagination;

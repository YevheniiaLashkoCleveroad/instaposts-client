export function getPagination({ total, limit, offset }) {
    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.floor(offset / limit) + 1;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return {
        pages,
        currentPage,
        totalPages,
    };
}

const DeleteModal = ({ isOpen, entityId, onClose, onDelete, entityName }) => {
    if (!isOpen || !entityId) return null;

    return (
        <div
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50"
            role="dialog" aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded shadow-lg w-full max-w-md">
                <h2 className="text-lg text-accent font-bold text-indigo-600 mb-2 border-b border-gray-200 px-6 py-4">
                    Delete {entityName ? `${entityName}` : ''}
                </h2>
                <p className="text-gray-700 px-6 py-2">Are you sure?</p>

                <div className="flex justify-end gap-2 p-6">
                    <button
                        onClick={onClose}
                        className="size-10 font-semibold flex items-center justify-center border border-gray-200 transition rounded text-gray-700 hover:bg-gray-100"
                    >
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                    <button
                        onClick={() => {
                            onDelete(entityId);
                        }}
                        className="size-10 font-semibold flex items-center justify-center border border-indigo-600 hover:border-indigo-700 transition rounded text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModal;

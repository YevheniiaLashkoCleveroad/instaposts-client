export const renderAvatar = (user, size = 30, onClick = null, additionalStyle = 'text-md') => {
    const style = { width: size, height: size };
    if (user?.avatar?.url) {
        return (
            <img
                src={`${import.meta.env.VITE_API_BASE_URL}${user.avatar.url}`}
                alt={user?.username || 'avatar'}
                className="cursor-pointer rounded-full object-cover shrink-0 aspect-square"
                style={style}
                loading="lazy"
                onClick={onClick}
            />
        );
    }
    return (
        <div
            className={`rounded-full cursor-pointer bg-indigo-500 text-white flex items-center justify-center font-semibold ${additionalStyle} shrink-0 aspect-square`}
            style={style}
            aria-label={user?.username || 'avatar'}
            onClick={onClick}
        >
            {(user?.username?.[0] ?? '?').toUpperCase()}
        </div>
    );
};

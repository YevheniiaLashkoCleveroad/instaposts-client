import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchBlockedByMeList, unblockUser} from '../store/slices/usersSlice';
import {renderAvatar} from '../utils/renderAvatarHelper.jsx';
import {useNavigate} from "react-router";

export default function BlacklistManager({ onOpenProfile }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {list, count, loading, hasMore, nextOffset} = useSelector(s => s.users.blacklist);

    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounced(query, 350);

    const scrollerRef = useRef(null);
    const loaderRef   = useRef(null);
    const inFlightRef = useRef(false);

    const [userHasScrolled, setUserHasScrolled] = useState(false);

    const goToProfile = (id) => {
        navigate(`/users/${id}`);
        onOpenProfile?.();
    };

    useEffect(() => {
        dispatch(fetchBlockedByMeList({ limit: 10, offset: 0, query: debouncedQuery }));
        scrollerRef.current?.scrollTo?.({ top: 0, behavior: 'auto' });
        setUserHasScrolled(false);
    }, [dispatch, debouncedQuery]);

    useEffect(() => {
        const root = scrollerRef.current;
        const target = loaderRef.current;
        if (!root || !target) return;
        if (!userHasScrolled) return;

        const io = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            if (loading || !hasMore || inFlightRef.current) return;

            inFlightRef.current = true;
            dispatch(fetchBlockedByMeList({ limit: 10, offset: nextOffset, query: debouncedQuery }))
                .finally(() => setTimeout(() => { inFlightRef.current = false; }, 60));
        }, { root, rootMargin: '200px 0px', threshold: 0.01 });

        io.observe(target);
        return () => io.disconnect();
    }, [dispatch, loading, hasMore, nextOffset, debouncedQuery, userHasScrolled]);

    return (
        <div className="space-y-3">
            <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full border border-gray-200 text-sm rounded px-3 py-2 outline-none focus:ring-[3px] focus:ring-indigo-300"
            />

            <div
                ref={scrollerRef}
                onScroll={(e) => {
                    if (!userHasScrolled && e.currentTarget.scrollTop > 0) setUserHasScrolled(true);
                }}
                className="max-h-64 sm:max-h-72 overflow-auto rounded-lg border border-gray-200 bg-white hide-scrollbar"
            >
                {loading && list.length === 0 && (
                    <div className="text-sm text-gray-500 p-3">Loading…</div>
                )}

                {!loading && list.length === 0 && (
                    <div className="text-sm text-gray-500 p-3">No users found.</div>
                )}

                {!!list.length && (
                    <ul className="divide-y divide-gray-100">
                        {list.map(u => (
                            <li key={u.id} className="flex items-center gap-3 py-2 px-2.5 hover:bg-gray-50/60">
                                {renderAvatar(u, 36, () => goToProfile(u.id), 'text-sm')}
                                <div className="min-w-0 flex-1">
                                    <button
                                        type="button"
                                        onClick={() => goToProfile(u.id)}
                                        className="font-medium cursor-pointer truncate text-left"
                                        title={`@${u.username}`}
                                    >
                                        @{u.username}
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => dispatch(unblockUser(u.id))}
                                    className="rounded-full bg-white border border-gray-200 size-9 transition text-red-600 hover:bg-red-50 hover:border-red-100"
                                    title="Remove from blacklist"
                                >
                                    <i className="text-base fa-solid fa-lock-open" />
                                </button>
                            </li>
                        ))}

                        {hasMore && (
                            <li aria-hidden>
                                <div ref={loaderRef} className="h-px" />
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {!!list.length && (
                <div className="text-xs text-gray-500 mt-1">{list.length} of {count}</div>
            )}
        </div>
    );
}

function useDebounced(value, delay) {
    const [v, setV] = useState(value);
    const t = useRef(null);
    useEffect(() => {
        if (t.current) clearTimeout(t.current);
        t.current = setTimeout(() => setV(value), delay);
        return () => t.current && clearTimeout(t.current);
    }, [value, delay]);
    return v;
}

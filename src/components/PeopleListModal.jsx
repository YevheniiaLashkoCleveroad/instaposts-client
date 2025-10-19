import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigate} from 'react-router';
import {renderAvatar} from '../utils/renderAvatarHelper.jsx';
import {
    fetchFollowersByUser,
    fetchFollowingByUser,
} from '../store/slices/usersSlice.js';

const EMPTY_SLOT = { list: [], count: 0, loading: false, hasMore: false, nextOffset: 0 };

export default function PeopleListModal({ open, onClose, userId, initialTab = 'followers' }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [tab, setTab] = useState(initialTab);
    const [query, setQuery] = useState('');
    const debounced = useDebounced(query, 300);

    const followersSlot = useSelector(s => s.users.followersByUser?.[userId]) || EMPTY_SLOT;
    const followingSlot = useSelector(s => s.users.followingByUser?.[userId]) || EMPTY_SLOT;

    const slot = tab === 'followers' ? followersSlot : followingSlot;

    const scrollerRef = useRef(null);
    const loaderRef   = useRef(null);
    const inFlightRef = useRef(false);

    useEffect(() => {
        if (!open) return;
        setTab(initialTab);
        setQuery('');
    }, [open, initialTab]);

    useEffect(() => {
        if (!open || !userId) return;
        const params = { userId, limit: 30, offset: 0, query: debounced };
        if (tab === 'followers') dispatch(fetchFollowersByUser(params));
        else                     dispatch(fetchFollowingByUser(params));
        scrollerRef.current?.scrollTo?.({ top: 0, behavior: 'auto' });
    }, [open, userId, tab, debounced, dispatch]);

    useEffect(() => {
        if (!open) return;
        const root = scrollerRef.current;
        const target = loaderRef.current;
        if (!root || !target) return;

        const io = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            if (slot.loading || !slot.hasMore || inFlightRef.current) return;

            inFlightRef.current = true;
            const params = { userId, limit: 30, offset: slot.nextOffset, query: debounced };
            const req = tab === 'followers'
                ? fetchFollowersByUser(params)
                : fetchFollowingByUser(params);

            dispatch(req).finally(() => setTimeout(() => { inFlightRef.current = false; }, 60));
        }, { root, rootMargin: '240px 0px', threshold: 0.01 });

        io.observe(target);
        return () => io.disconnect();
    }, [open, userId, tab, slot.loading, slot.hasMore, slot.nextOffset, debounced, dispatch]);

    const goToProfile = (id) => {
        onClose?.();
        navigate(`/users/${id}`);
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[1200] bg-black/50 flex items-center justify-center p-3 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div className="bg-white w-full max-w-[720px] max-h-[92vh] rounded overflow-hidden shadow-xl flex flex-col">
                <header className="px-5 py-3 border-b border-gray-200 bg-white sticky top-0 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            className={`px-3 py-1.5 rounded font-semibold text-sm ${tab === 'followers' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setTab('followers')}
                        >
                            Followers
                             </button>
                        <button
                            className={`px-3 py-1.5 rounded font-semibold text-sm ${tab === 'following' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            onClick={() => setTab('following')}
                        >
                            Following
                        </button>
                    </div>

                    <button className="px-2 py-1 rounded hover:bg-gray-100" onClick={onClose}>
                        <i className="fa-solid fa-xmark text-lg"/>
                    </button>
                </header>

                <div className="p-4 border-b border-gray-100">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by username…"
                        className="w-full border border-gray-200 text-sm rounded px-3 py-2 outline-none focus:ring-[3px] focus:ring-indigo-300"
                    />
                </div>

                <div ref={scrollerRef} className="flex-1 min-h-0 overflow-auto">
                     {slot.loading && slot.list.length === 0 && (
                        <div className="text-sm text-gray-500 p-4">Loading…</div>
                    )}

                    {!slot.loading && slot.list.length === 0 && (
                        <div className="text-sm text-gray-500 p-4">No users found.</div>
                    )}

                    {!!slot.list.length && (
                        <ul className="divide-y divide-gray-100">
                            {slot.list.map(u => (
                                <li key={u.id} className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50/70">
                                    {renderAvatar(u, 36, () => goToProfile(u.id), 'text-sm')}
                                    <button
                                        className="font-medium truncate text-left"
                                        title={`@${u.username}`}
                                        onClick={() => goToProfile(u.id)}
                                    >
                                        @{u.username}
                                    </button>

                                    <div className="ml-auto shrink-0">
                                        <button
                                            className="rounded-full bg-white border border-gray-200 size-9 transition hover:bg-gray-100"
                                            title="Open profile"
                                            onClick={() => goToProfile(u.id)}
                                        >
                                            <i className="fa-solid fa-arrow-right"></i>
                                        </button>
                                    </div>
                                </li>
                            ))}
                            <li aria-hidden><div ref={loaderRef} className="h-px" /></li>
                        </ul>
                    )}
                </div>

                {!!slot.list.length && (
                    <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
                        {slot.list.length} of {slot.count}
                    </div>
                )}
            </div>
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

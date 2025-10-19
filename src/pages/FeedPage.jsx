import {useDispatch, useSelector} from 'react-redux';
import {useEffect, useRef, useState} from 'react';
import {useSearchParams} from 'react-router';
import Select from 'react-select';

import PageHeader from '../components/PageHeader.jsx';
import {findOption, selectStyles, selectTheme} from '../utils/selectHelper.js';
import {fetchPosts} from '../store/slices/postsSlice.js';
import PostCard from '../components/PostCard.jsx';
import PostModal from '../components/PostModal.jsx';

const ORDER_FIELDS = [{value: 'createdAt', label: 'Date'}];
const DIRS = [{value: 'DESC', label: 'DESC'}, {value: 'ASC', label: 'ASC'}];
const PAGE_SIZE = 8;

export default function FeedPage() {
    const dispatch = useDispatch();
    const {user} = useSelector(s => s.auth);
    const {list, loading, loadingMore, hasMore, nextOffset} = useSelector(s => s.posts);
    const [openedPostId, setOpenedPostId] = useState(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const orderBy = searchParams.get('orderBy') || 'createdAt';
    const orderDirection = searchParams.get('orderDirection') || 'DESC';

    useEffect(() => {
        if (!user?.id) return;
        dispatch(fetchPosts({
            limit: PAGE_SIZE,
            offset: 0,
            orderBy,
            orderDirection,
            userId: user.id,
            isFeed: true,
        }));
    }, [dispatch, user?.id, orderBy, orderDirection]);

    const loaderRef = useRef(null);
    const inFlightRef = useRef(false);

    useEffect(() => {
        const el = loaderRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                if (!user?.id || loading || loadingMore || !hasMore || inFlightRef.current) return;

                inFlightRef.current = true;
                dispatch(fetchPosts({
                    limit: PAGE_SIZE,
                    offset: nextOffset,
                    orderBy,
                    orderDirection,
                    userId: user.id,
                    isFeed: true,
                })).finally(() => {
                    setTimeout(() => {
                        inFlightRef.current = false;
                    }, 80);
                });
            },
            {root: null, rootMargin: '300px 0px', threshold: 0.01}
        );

        io.observe(el);
        return () => io.disconnect();
    }, [dispatch, user?.id, nextOffset, hasMore, loading, loadingMore, orderBy, orderDirection]);

    const onOrderByChange = (opt) => {
        const next = new URLSearchParams(searchParams);
        next.set('orderBy', opt?.value ?? 'createdAt');
        setSearchParams(next, {replace: true});
    };
    const onOrderDirChange = (opt) => {
        const next = new URLSearchParams(searchParams);
        next.set('orderDirection', opt?.value ?? 'DESC');
        setSearchParams(next, {replace: true});
    };

    return (
        <>
            <PageHeader>
                <img src="/title-font-logo.png" alt="Logo" className="h-16 md:h-20 mt-40 md:mt-30"/>
                <h1 className="w-full text-center text-accent text-gray-900 text-2xl md:text-3xl">
                    Share Your Mind!
                </h1>
            </PageHeader>
            <div className="px-4 py-6 md:p-8 max-w-7xl mx-auto">

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
                    <h1 className="text-accent text-3xl text-center text-indigo-700 md:text-start">Feed</h1>

                    <div className="flex flex-col md:flex-row gap-2 md:items-center">
                        <Select
                            className="w-full md:w-40"
                            classNamePrefix="rs"
                            options={ORDER_FIELDS}
                            value={findOption(ORDER_FIELDS, orderBy)}
                            onChange={onOrderByChange}
                            isSearchable={false}
                            styles={selectStyles}
                            theme={selectTheme}
                            placeholder="Order field"
                            menuPortalTarget={document.body}
                        />
                        <Select
                            className="w-full md:w-36"
                            classNamePrefix="rs"
                            options={DIRS}
                            value={findOption(DIRS, orderDirection)}
                            onChange={onOrderDirChange}
                            isSearchable={false}
                            styles={selectStyles}
                            theme={selectTheme}
                            placeholder="Direction"
                            menuPortalTarget={document.body}
                        />
                    </div>
                </div>

                {loading && !list.length && (
                    <div className="text-gray-500 text-center">Loading...</div>
                )}

                {!loading && list.length === 0 && (
                    <div className="text-gray-500 text-center">Your feed is empty...</div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {list.map(p => (
                        <div key={p.id} onClick={() => setOpenedPostId(p.id)} className="cursor-pointer">
                            <PostCard post={p} isFeed={true}/>
                        </div>
                    ))}
                </div>

                <div ref={loaderRef} className="h-12 flex items-center justify-center">
                    {loadingMore && <div className="text-gray-500 text-sm">Loading...</div>}
                    {!hasMore && list.length > 0 && (
                        <div className="text-gray-400 text-xs">No more posts</div>
                    )}
                </div>

                {openedPostId && <PostModal postId={openedPostId} onClose={() => setOpenedPostId(null)}/>}
            </div>
        </>
    );
}

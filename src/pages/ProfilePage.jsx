import {useEffect, useMemo, useRef, useState} from 'react';
import {shallowEqual, useDispatch, useSelector} from 'react-redux';
import {useParams} from 'react-router';
import {
    fetchUserById,
    fetchBlockedByMe,
    fetchBlockedMe,
    checkFollowState,
    fetchMyFollowers
} from '../store/slices/usersSlice';
import {fetchPosts} from '../store/slices/postsSlice';
import PostModal from '../components/PostModal.jsx';
import CreatePostModal from '../components/CreatePostModal.jsx';
import ProfileSettingsModal from '../components/ProfileSettingsModal.jsx';
import ProfileActions from '../components/ProfileActions.jsx';
import {renderAvatar} from '../utils/renderAvatarHelper.jsx';
import PostCard from "../components/PostCard.jsx";
import PageHeader from "../components/PageHeader.jsx";
import PeopleListModal from "../components/PeopleListModal.jsx";

const PAGE_SIZE = 16;

export default function ProfilePage() {
    const {id} = useParams();
    const uid = Number(id);

    const dispatch = useDispatch();
    const me = useSelector(s => s.auth.user);
    const {profile, profileLoading, blockedByMeIds, blockedMeIds} = useSelector(s => s.users);
    const {list, count: postsTotal, loading, loadingMore, hasMore, nextOffset} = useSelector(s => s.posts);

    const [openedPostId, setOpenedPostId] = useState(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);
    const [openPeople, setOpenPeople] = useState({ open: false, tab: 'followers' });

    useEffect(() => {
        if (!uid) return;
        dispatch(fetchUserById(uid));
        dispatch(fetchBlockedByMe());
        dispatch(fetchBlockedMe());
        dispatch(fetchMyFollowers({offset: 0}));
        dispatch(fetchPosts({
            limit: PAGE_SIZE,
            offset: 0,
            orderBy: 'createdAt',
            orderDirection: 'DESC',
            userId: uid,
        }));
    }, [uid, dispatch]);

    const loaderRef = useRef(null);
    const inFlightRef = useRef(false);

    useEffect(() => {
        const el = loaderRef.current;
        if (!el) return;

        const io = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            if (loading || loadingMore || !hasMore || inFlightRef.current) return;

            inFlightRef.current = true;
            dispatch(fetchPosts({
                limit: PAGE_SIZE,
                offset: nextOffset,
                orderBy: 'createdAt',
                orderDirection: 'DESC',
                userId: uid,
            })).finally(() => setTimeout(() => {
                inFlightRef.current = false;
            }, 80));
        }, {root: null, rootMargin: '300px 0px', threshold: 0.01});

        io.observe(el);
        return () => io.disconnect();
    }, [dispatch, uid, nextOffset, hasMore, loading, loadingMore]);

    const isMe = me?.id === uid;

    const isBlockedByMe = blockedByMeIds.includes(uid) || profile?.blockedByMe;
    const isBlockedMe = blockedMeIds.includes(uid) || profile?.blockedMe;
    const noAccess = isBlockedByMe || isBlockedMe;

    const followerIds = useSelector(
        s => (s.users.followers.list ?? []).map(u => u.id),
        shallowEqual
    );

    const followersIdSet = useMemo(() => new Set(followerIds), [followerIds]);

    const postsCount = postsTotal ?? 0;
    const followers = profile?.subscribersCount ?? profile?.followersCount ?? 0;
    const following = profile?.subscriptionsCount ?? profile?.followingCount ?? 0;

    useEffect(() => {
        if (!profile?.username || isMe) return;
        dispatch(checkFollowState({id: uid, username: profile.username}));
    }, [dispatch, uid, isMe, profile?.username]);

    return (
        <>
        <PageHeader height={'500px'}>
            <section
                className={`${profile?.bio ? 'mt-15 md:mt-35' : 'mt-27 md:mt-47'} w-full max-w-7xl flex items-center flex-col md:flex-row gap-6 py-2 px-5`}>
                <div className="shrink-0">
                    {profile ? renderAvatar(profile, 96, null, 'text-2xl') :
                        <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse"/>}
                </div>

                <div className="flex flex-col gap-1 min-w-0 w-full">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                        <div className="flex flex-wrap md:flex-nowrap w-full md:w-auto justify-center items-center gap-3 mb-2">
                            <h1 className="text-2xl font-semibold text-gray-900">
                                {profileLoading ? '…' : `@${profile?.username ?? ''}`}
                            </h1>

                            {profile?.isVerified && (
                                <span
                                    className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-white/50 text-indigo-700 mb-1"><i
                                    className="fa-solid fa-check"></i></span>
                            )}

                            {!isMe && followersIdSet.has(uid) && (
                                <span
                                    className="mb-1 h-[16px] inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded bg-white/50 text-blue-700 shrink-0"
                                    title="This user follows you"
                                >
                                  <i className="fa-solid fa-user-check text-[9px] mt-0.5"/>
                                  <span className="hidden sm:inline text-[9px] mt-0.5">Follows you</span>
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap w-autho md:w-full justify-end md:justify-center">
                            {isMe ? (
                                <button
                                    onClick={() => setOpenSettings(true)}
                                    className="ml-auto text-2xl text-gray-700 hover:text-gray-900 transition"
                                >
                                    <i className="fa-solid fa-gear"></i>
                                </button>
                            ) : (
                                <ProfileActions profileId={uid}/>
                            )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-gray-700 justify-center md:justify-start">
                            <span><span
                                className="font-semibold">{profileLoading ? '...' : postsCount}</span> posts</span>
                   <button
                         className="hover:underline"
                         onClick={() => setOpenPeople({ open: true, tab: 'followers' })}
                       >
                         <span className="font-semibold">{profileLoading ? '...' : followers}</span> followers
                       </button>
                       <button
                         className="hover:underline"
                         onClick={() => setOpenPeople({ open: true, tab: 'following' })}
                       >
                         <span className="font-semibold">{profileLoading ? '...' : following}</span> following
                       </button>
                </div>
            </div>
        </section>

        {!!profile?.bio && (
            <div className="w-full max-w-7xl py-2 px-6 text-center md:text-start text-sm text-gray-800 whitespace-pre-wrap mb-4">{profile.bio}</div>
        )}
        </PageHeader>
    <div className="max-w-7xl mx-auto p-6 mt-4">

        {noAccess && (
            <div className="p-6 border border-red-200 rounded bg-red-50 text-red-700 mb-4">
                You cannot view this profile.
            </div>
        )}

        {!noAccess && (
            <>
                {loading && !list.length && (
                    <div className="text-gray-500 text-center py-8 border-t border-gray-200">Loading...</div>
                )}

                {!loading && list.length === 0 && (
                    <div className="text-gray-500 text-center py-8 border-t border-gray-200">No posts
                        yet...</div>
                )}

                {list.length ? <div
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 border-t border-gray-200 pt-6">
                    {list.map(p => (
                        <div key={p.id} onClick={() => setOpenedPostId(p.id)} className="cursor-pointer">
                            <PostCard post={p} isFeed={false}/>
                        </div>
                    ))}
                </div> : null}

                <div ref={loaderRef} className="h-12 flex items-center justify-center">
                    {loadingMore && <div className="text-gray-500 text-sm">Loading...</div>}
                    {!hasMore && list.length > 0 && (
                        <div className="text-gray-400 text-xs">No more posts</div>
                    )}
                </div>
            </>
        )}

        {openedPostId && (
            <PostModal postId={openedPostId} onClose={() => setOpenedPostId(null)}/>
        )}

        {openCreate && (
            <CreatePostModal open={openCreate} onClose={() => setOpenCreate(false)}/>
        )}

        {openSettings && (
            <ProfileSettingsModal open={openSettings} onClose={() => setOpenSettings(false)}/>
        )}

        {openPeople.open && (
              <PeopleListModal
                open
                onClose={() => setOpenPeople(p => ({...p, open: false}))}
                userId={uid}
                initialTab={openPeople.tab}
              />
            )}
    </div>
</>
)
    ;
}

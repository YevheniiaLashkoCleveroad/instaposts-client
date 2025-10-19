import {useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {blockUser, unblockUser, followUser, unfollowUser} from '../store/slices/usersSlice';

export default function ProfileActions({profileId}) {
    const dispatch = useDispatch();
    const me = useSelector(s => s.auth.user);
    const {profile, blockedByMeIds, blockedMeIds} = useSelector(s => s.users);
    const isMe = me?.id === profileId;

    const isFollowed = !!profile?.isFollowedByMe;
    const isBlockedByMe = useMemo(() => blockedByMeIds.includes(profileId) || profile?.blockedByMe, [blockedByMeIds, profileId, profile?.blockedByMe]);
    const isBlockedMe = useMemo(() => blockedMeIds.includes(profileId) || profile?.blockedMe, [blockedMeIds, profileId, profile?.blockedMe]);

    if (isMe) return null;

    return (
        <div className="flex flex-wrap gap-3 ml-auto">
            {(!isBlockedByMe && !isBlockedMe) && (
                <button
                    onClick={() => dispatch(isFollowed ? unfollowUser(profileId) : followUser(profileId))}
                    className={`rounded-full bg-white border border-gray-100 size-10 transition text-accent ${isFollowed ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-100' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100 hover:border-gray-200'}`}
                    title={isFollowed ? 'Unsubscribe from user' : 'Subscribe to user'}
                >
                    {isFollowed ? <i className="text-lg fa-solid fa-user-minus"></i> : <i className="text-lg fa-solid fa-user-plus"></i>}
                </button>
            )}

            <button
                onClick={() => dispatch(isBlockedByMe ? unblockUser(profileId) : blockUser(profileId))}
                className={`rounded-full bg-white border border-gray-100 size-10 transition text-accent ${isBlockedByMe ? 'text-red-700 hover:text-red-800 hover:bg-red-50 hover:border-red-100': 'text-gray-400 hover:text-gray-500 hover:bg-gray-100 hover:border-gray-200'}`}
                title={isBlockedByMe ? 'Remove from blacklist' : 'Add to blacklist'}
            >
                {isBlockedByMe ? <i className="text-lg fa-solid fa-lock-open"></i> : <i className="text-lg fa-solid fa-lock"></i>}
            </button>
        </div>
    );
}

import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {blockUser, checkFollowState, followUser, unblockUser, unfollowUser} from "../store/slices/usersSlice.js";

export default function UserListActions({user}) {
    const dispatch = useDispatch();
    const me = useSelector(s => s.auth.user);
    const {blockedByMeIds, blockedMeIds} = useSelector(s => s.users);

    const isMe = me?.id === user.id;

    const [isFollowed, setIsFollowed] = useState(
        typeof user.isFollowedByMe === 'boolean' ? !!user.isFollowedByMe : false
    );

    const isBlockedByMe = blockedByMeIds.includes(user.id) || user.blockedByMe;
    const isBlockedMe = blockedMeIds.includes(user.id) || user.blockedMe;

    useEffect(() => {
        if (isMe) return;
        if (typeof user.isFollowedByMe === 'boolean') {
            setIsFollowed(!!user.isFollowedByMe);
            return;
        }
        dispatch(checkFollowState({id: user.id, username: user.username}))
            .unwrap()
            .then(({isFollowed}) => setIsFollowed(isFollowed))
            .catch(() => {
            });
    }, [dispatch, user.id, user.username, user.isFollowedByMe, isMe]);

    if (isMe) return null;

    const toggleFollow = (e) => {
        e.stopPropagation();
        if (isFollowed) {
            dispatch(unfollowUser(user.id))
                .unwrap()
                .then(() => setIsFollowed(false))
                .catch(() => {
                });
        } else {
            dispatch(followUser(user.id))
                .unwrap()
                .then(() => setIsFollowed(true))
                .catch((msg) => {
                    if (typeof msg === 'string' && /already subscribed/i.test(msg)) {
                        setIsFollowed(true);
                    }
                });
        }
    };

    const toggleBlock = (e) => {
        e.stopPropagation();
        if (isBlockedByMe) {
            dispatch(unblockUser(user.id));
        } else {
            dispatch(blockUser(user.id));
            setIsFollowed(false);
        }
    };

    return (
        <div className="flex items-center gap-2 ml-auto">
            {(!isBlockedByMe && !isBlockedMe) && (
                <button
                    onClick={toggleFollow}
                    className={`rounded-full bg-white border border-gray-100 size-9 transition ${isFollowed
                        ? 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-100'
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100 hover:border-gray-200'}`}
                    title={isFollowed ? 'Unsubscribe from user' : 'Subscribe to user'}
                >
                    <i className={`text-base fa-solid ${isFollowed ? 'fa-user-minus' : 'fa-user-plus'}`}></i>
                </button>
            )}

            <button
                onClick={toggleBlock}
                className={`rounded-full bg-white border border-gray-100 size-9 transition ${isBlockedByMe
                    ? 'text-red-700 hover:text-red-800 hover:bg-red-50 hover:border-red-100'
                    : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100 hover:border-gray-200'}`}
                title={isBlockedByMe ? 'Remove from blacklist' : 'Add to blacklist'}
            >
                <i className={`text-base fa-solid ${isBlockedByMe ? 'fa-lock-open' : 'fa-lock'}`}></i>
            </button>
        </div>
    );
}

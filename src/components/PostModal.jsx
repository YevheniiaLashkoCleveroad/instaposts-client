import {useEffect, useMemo, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchPostById, updatePost, deletePost} from '../store/slices/postsSlice';
import {addComment, deleteComment, fetchComments, updateComment} from '../store/slices/commentsSlice';
import {renderAvatar} from '../utils/renderAvatarHelper.jsx';
import DeleteModal from './DeleteModal.jsx';
import {isVideoFile, toAbsolute} from "../utils/fileHelper.js";
import SmartVideo from "./SmartVideo.jsx";

export default function PostModal({postId, onClose}) {
    const dispatch = useDispatch();
    const {current, currentLoading} = useSelector((s) => s.posts);
    const me = useSelector((s) => s.auth.user);
    const slot =
        useSelector((s) => s.comments.byPostId[postId]) ||
        {list: [], count: 0, limit: 20, offset: 0, loading: false, loadingMore: false, hasMore: true};

    const [editMode, setEditMode] = useState(false);
    const [descDraft, setDescDraft] = useState('');
    const [commentText, setCommentText] = useState('');
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editDraft, setEditDraft] = useState('');
    const [deleteCommentId, setDeleteCommentId] = useState(null);

    const isAuthor = useMemo(() => current && me && current.author?.id === me.id, [current, me]);

    const scrollRef = useRef(null);
    const loaderRef = useRef(null);

    useEffect(() => {
        if (!postId) return;
        dispatch(fetchPostById(postId));
        dispatch(fetchComments({postId, limit: 20, offset: 0}));
    }, [dispatch, postId]);

    useEffect(() => {
        setDescDraft(current?.description ?? '');
    }, [current?.description]);

    useEffect(() => {
        const onEsc = (e) => e.key === 'Escape' && !deleteOpen && onClose?.();
        window.addEventListener('keydown', onEsc);
        return () => window.removeEventListener('keydown', onEsc);
    }, [onClose, deleteOpen]);

    const overlayClick = (e) => {
        if (e.target === e.currentTarget && !deleteOpen) onClose?.();
    };

    const onSaveDescription = async () => {
        await dispatch(updatePost({id: postId, description: descDraft})).unwrap();
        setEditMode(false);
    };

    const confirmDelete = async (id) => {
        await dispatch(deletePost(id)).unwrap();
        setDeleteOpen(false);
        onClose?.();
    };

    const onAddComment = async (e) => {
        e.preventDefault();
        const content = commentText.trim();
        if (!content) return;
        await dispatch(addComment({postId, content})).unwrap();
        setCommentText('');
    };

    useEffect(() => {
        if (!loaderRef.current) return;
        const rootEl = scrollRef.current || null;

        const io = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (!entry.isIntersecting) return;
                if (slot.hasMore && !slot.loading && !slot.loadingMore) {
                    const nextOffset = slot.list?.length || 0;
                    dispatch(fetchComments({postId, limit: slot.limit || 20, offset: nextOffset}));
                }
            },
            {root: rootEl, threshold: 0.6}
        );

        io.observe(loaderRef.current);
        return () => io.disconnect();
    }, [dispatch, postId, slot.hasMore, slot.loading, slot.loadingMore, slot.limit, slot.list?.length]);

    const startEdit = (c) => {
        setEditingCommentId(c.id);
        setEditDraft(c.content || '');
    };
    const cancelEdit = () => {
        setEditingCommentId(null);
        setEditDraft('');
    };
    const saveEdit = async () => {
        if (!editDraft.trim()) return;
        await dispatch(updateComment({id: editingCommentId, postId, content: editDraft.trim()})).unwrap();
        cancelEdit();
    };

    return (
        <div onClick={overlayClick} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
            <div className="bg-white w-[min(1100px,95vw)] h-[90vh] rounded overflow-hidden grid grid-cols-1 md:grid-cols-[minmax(0,60%)_minmax(320px,40%)]">
                <div className="relative bg-black">
                    {current?.file?.url && !isVideoFile(current.file) && (
                        <img
                            src={toAbsolute(current.file.url)}
                            alt="post"
                            className="absolute inset-0 w-full h-full object-contain"
                        />
                    )}

                    {current?.file?.url && isVideoFile(current.file) && (
                        <SmartVideo
                            src={toAbsolute(current.file.url)}
                            auto
                            controls
                            loop
                            muted={false}
                            fit="contain"
                            preload="auto"
                            className="absolute inset-0"
                        />
                    )}
                </div>

                <div className="flex flex-col h-full min-h-0">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            {current?.author && renderAvatar(current.author, 36, () => {
                            })}
                            <div className="flex flex-col">
                                <div className="font-medium text-gray-900">@{current?.author?.username}</div>
                                <div
                                    className="text-xs text-gray-500">{current && new Date(current.createdAt).toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isAuthor && (
                                <>
                                    {!editMode && (
                                        <button className="px-2 py-1 hover:text-indigo-600"
                                                onClick={() => setEditMode(true)}>
                                            <i className="fa-regular fa-pen-to-square mr-1"/>
                                        </button>
                                    )}
                                    <button className="px-2 py-1 rounded hover:text-red-600"
                                            onClick={() => setDeleteOpen(true)}>
                                        <i className="fa-regular fa-trash-can mr-1"/>
                                    </button>
                                </>
                            )}

                            <button className="px-2 py-1 text-sm rounded hover:bg-gray-100" onClick={onClose}>
                                <i className="fa-solid fa-xmark text-lg"/>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 p-4 overflow-hidden flex flex-col gap-4">
                        <div className="border border-gray-200 rounded p-3">
                            {!editMode ? (
                                <p className="whitespace-pre-wrap text-gray-800 text-sm">
                                    {currentLoading ? 'Loading...' : (current?.description || 'No description...')}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    <textarea
                                        maxLength={500}
                                        value={descDraft}
                                        onChange={(e) => setDescDraft(e.target.value)}
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-[3px] focus:ring-indigo-300"
                                    />

                                    <div className="flex gap-2">
                                        <button onClick={onSaveDescription}
                                                className="px-4 py-1.5 font-semibold text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700">Save
                                        </button>
                                        <button onClick={() => {
                                            setEditMode(false);
                                            setDescDraft(current?.description || '');
                                        }} className="px-3 py-1.5 border border-gray-200 font-semibold text-sm rounded hover:bg-gray-100">Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-h-0 basis-0 flex flex-col">
                            <div className="text-sm text-gray-500 mb-2">Comments ({slot.count ?? 0})</div>

                            <ul ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain space-y-3 pr-2">
                                {(slot.list || []).map((c) => {
                                    const mine = me?.id === c.author?.id;
                                    const isEditing = editingCommentId === c.id;
                                    const canDelete = mine || isAuthor;

                                    return (
                                        <li key={c.id} className="flex items-start gap-3">
                                            {renderAvatar(c.author, 28)}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-1">
                                                        <div className="text-sm">
                                                            <span
                                                                className="font-medium text-indigo-800">@{c.author?.username}</span>{' '}
                                                            {!isEditing &&
                                                                <span className="text-gray-700">{c.content}</span>}
                                                        </div>
                                                        <div
                                                            className="text-[11px] text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>

                                                        {isEditing && (
                                                            <div className="mt-2 space-y-2">
                                                                <textarea
                                                                    maxLength={500}
                                                                      rows={2}
                                                                      value={editDraft}
                                                                      onChange={(e) => setEditDraft(e.target.value)}
                                                                      className="w-full border border-gray-300 rounded p-2 text-sm outline-none focus:ring-[3px] focus:ring-indigo-300"
                                                                  />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={saveEdit}
                                                                        className="px-4 py-1.5 border border-gray-200 font-semibold text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={cancelEdit}
                                                                        className="px-3 py-1.5 text-sm border border-gray-200 font-semibold rounded hover:bg-gray-100"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {canDelete && !isEditing && (
                                                        <div className="shrink-0 flex gap-1 text-gray-400">
                                                            { mine && (<button
                                                                className="p-1 text-sm hover:text-indigo-600"
                                                                title="Edit"
                                                                onClick={() => startEdit(c)}
                                                            >
                                                                <i className="fa-regular fa-pen-to-square"/>
                                                            </button>)}
                                                            <button
                                                                className="p-1 text-sm hover:text-red-600"
                                                                title="Delete"
                                                                onClick={() => setDeleteCommentId(c.id)}
                                                            >
                                                                <i className="fa-regular fa-trash-can"/>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}

                                {slot.loadingMore &&
                                    <li className="py-3 text-center text-gray-400 text-sm">Loading...</li>}
                                {slot.hasMore && <li ref={loaderRef} className="h-8"/>}
                            </ul>


                            {!slot.loading && (slot.list?.length ?? 0) === 0 && (
                                <div className="text-gray-400 text-sm mt-2">No comments yet...</div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={onAddComment} className="shrink-0 border-t border-gray-200 p-3 flex gap-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[3px] focus:ring-indigo-300"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 shadow rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
                            disabled={!commentText.trim()}
                        >
                            <i className="-ml-1 mt-0.5 text-lg fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>

            <DeleteModal
                isOpen={deleteOpen}
                entityId={postId}
                entityName="post"
                onClose={() => setDeleteOpen(false)}
                onDelete={confirmDelete}
            />

            <DeleteModal
                isOpen={!!deleteCommentId}
                entityId={deleteCommentId}
                entityName="comment"
                onClose={() => setDeleteCommentId(null)}
                onDelete={(id) => {
                    dispatch(deleteComment({id, postId}));
                    setDeleteCommentId(null);
                }}
            />
        </div>
    );
}

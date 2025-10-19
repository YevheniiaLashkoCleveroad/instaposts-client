import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../store/slices/postsSlice.js';
import { renderAvatar } from '../utils/renderAvatarHelper.jsx';
import {isVideoFile} from "../utils/fileHelper.js";

export default function CreatePostModal({ open, onClose }) {
    const dispatch = useDispatch();
    const me = useSelector(s => s.auth.user);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [desc, setDesc] = useState('');
    const [uploadPct, setUploadPct] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef(null);

    const objectUrlRef = useRef('');

    useEffect(() => {
        if (!open) {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = '';
            }
            setFile(null);
            setPreview('');
            setDesc('');
            setUploadPct(0);
            setSubmitting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const prevent = e => { e.preventDefault(); e.stopPropagation(); };
        window.addEventListener('dragover', prevent);
        window.addEventListener('drop', prevent);
        return () => {
            window.removeEventListener('dragover', prevent);
            window.removeEventListener('drop', prevent);
        };
    }, [open]);

    useEffect(() => {
        if (!file) {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = '';
            }
            setPreview('');
            return;
        }
        const url = URL.createObjectURL(file);
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = url;
        setPreview(url);

        return () => {};
    }, [file]);

    useEffect(() => () => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    }, []);

    const onDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        const f = e.dataTransfer?.files?.[0];
        if (f) {
            setFile(f);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    const onDragOver = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };

    const clearFile = () => {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = '';
        }
        setFile(null);
        setPreview('');
        setUploadPct(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const canSubmit = useMemo(() => !!file && !submitting, [file, submitting]);

    const submit = async (e) => {
        e?.preventDefault?.();
        if (!file) return;
        setSubmitting(true);
        try {
            await dispatch(createPost({ file, description: desc, onProgress: setUploadPct })).unwrap();
            onClose?.();
        } finally {
            setSubmitting(false);
        }
    };

    return !open ? null : (
        <div
            className="fixed inset-0 z-[4000] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div className="bg-white w-[min(1100px,95vw)] h-[90vh] rounded overflow-hidden grid grid-cols-1 md:grid-cols-[minmax(0,60%)_minmax(320px,40%)]">

                <div className="relative bg-gray-50 flex items-center justify-center min-h-[260px]" onDragOver={onDragOver} onDrop={onDrop}>
                    {!preview ? (
                        <div className="text-center px-6">
                            <div className="text-gray-500 text-sm mb-3">Drag & drop an image or video here</div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-3 rounded bg-gray-200 hover:bg-gray-300">
                                <img src="/create-post.svg" alt="Add media" />
                            </button>
                            <input
                                ref={fileInputRef}
                                className="hidden"
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <div className="mt-3 text-xs text-gray-400 italic">Only one file</div>
                        </div>
                    ) : (
                        <>
                            <div className="absolute inset-0">
                                {!isVideoFile(file) ? (
                                    <img
                                        src={preview}
                                        alt=""
                                        className="block w-full h-full object-contain select-none pointer-events-none bg-black"
                                    />
                                ) : (
                                    <video
                                        key={preview}
                                        className="block w-full h-full object-contain bg-black"
                                        src={preview}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                    />
                                )}
                            </div>

                            <div className="absolute top-3 right-3 pointer-events-none flex gap-2 z-10">
                                <button
                                    type="button"
                                    onClick={clearFile}
                                    className="pointer-events-auto size-9 rounded-full bg-white/90 shadow hover:bg-white text-red-600"
                                    title="Remove file"
                                >
                                    <i className="fa-regular fa-trash-can"></i>
                                </button>
                            </div>
                        </>
                    )}

                    {submitting && (
                        <div className="absolute left-0 right-0 bottom-0 h-1 bg-gray-200">
                            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${uploadPct}%` }} />
                        </div>
                    )}
                </div>


                <form onSubmit={submit} className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            {me && renderAvatar(me, 32)}
                            <div className="font-medium text-gray-900">@{me?.username}</div>
                        </div>
                        <button type="button" className="px-2 py-1 text-sm rounded hover:bg-gray-100" onClick={onClose}>
                            <i className="fa-solid fa-xmark text-lg" />
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-auto">
                        <label className="block text-sm text-gray-600 mb-2">Description (optional)</label>
                        <textarea
                            maxLength={500}
                            rows={6}
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            placeholder="Add a description..."
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-[3px] focus:ring-indigo-300"
                        />
                    </div>

                    <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
                        <button type="button" className="px-4 py-2 font-semibold rounded hover:bg-gray-100" onClick={onClose}>Cancel</button>
                        <button type="submit" disabled={!canSubmit} className="px-4 py-2 font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
                            {submitting ? 'Uploading...' : 'Share'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

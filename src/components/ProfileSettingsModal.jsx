import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {updateMyProfile, deleteMyAccount} from '../store/slices/usersSlice';
import {renderAvatar} from '../utils/renderAvatarHelper.jsx';
import BlacklistManager from "./BlacklistManager.jsx";

export default function ProfileSettingsModal({open, onClose}) {
    const dispatch = useDispatch();
    const me = useSelector(s => s.auth.user);

    const [username, setUsername] = useState(me?.username || '');
    const [bio, setBio] = useState(me?.bio || '');
    const [avatar, setAvatar] = useState(null);
    const [preview, setPreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const inputRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        setUsername(me?.username || '');
        setBio(me?.bio || '');
        setAvatar(null);
        setPreview('');
    }, [open, me]);

    useEffect(() => {
        if (!avatar) return;
        const url = URL.createObjectURL(avatar);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [avatar]);

    if (!open) return null;

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await dispatch(updateMyProfile({username, bio, avatar})).unwrap();
            onClose?.();
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (!confirmDelete) return;
        await dispatch(deleteMyAccount()).unwrap();
    };

    return (
        <div
            className="fixed inset-0 z-[1200] bg-black/50 flex items-center justify-center p-3 sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className="bg-white w-full max-w-[720px] max-h-[92vh] rounded overflow-hidden shadow-xl">
                <header
                    className="px-5 py-3 border-b border-gray-200 sticky top-0 bg-white z-10 flex items-center justify-between">
                    <h2 className="text-lg text-accent text-indigo-700 font-semibold">Profile settings</h2>
                    <button className="px-2 py-1 rounded hover:bg-gray-100" onClick={onClose}><i
                        className="fa-solid fa-xmark text-lg"/></button>
                </header>

                <form onSubmit={submit} className="p-5 space-y-4 overflow-y-auto max-h-[calc(92vh-52px)] hide-scrollbar">
                    <div className="flex gap-4 items-center">
                        {preview
                            ? <img src={preview} alt="" className="w-16 h-16 rounded-full object-cover"/>
                            : (me && renderAvatar(me, 64, null, 'text-xl'))
                        }
                        <div className="flex gap-2">
                            <button type="button"
                                    className="size-10 border border-gray-200 rounded-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 hover:border-indigo-200 transition"
                                    onClick={() => inputRef.current?.click()}>
                                <i className="fa-solid fa-pen"></i>
                            </button>
                            {preview && (
                                <button type="button"
                                        className="size-10 shadow rounded-full text-gray-700 hover:bg-gray-100"
                                        onClick={() => {
                                            setAvatar(null);
                                            setPreview('');
                                        }}>
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            )}
                            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                                   onChange={(e) => setAvatar(e.target.files?.[0] || null)}/>
                        </div>
                    </div>

                    <label className="block">
                        <div className="text-sm text-gray-600 mb-1">Username</div>
                        <input value={username} onChange={(e) => setUsername(e.target.value)}
                               className="w-full border border-gray-200 rounded px-3 py-2 outline-none focus:ring-[3px] focus:ring-indigo-300"/>
                    </label>

                    <label className="block">
                        <div className="text-sm text-gray-600 mb-1">Bio</div>
                        <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500}
                                  className="w-full border border-gray-200 overflow-auto rounded px-3 py-2 outline-none focus:ring-[3px] focus:ring-indigo-300"/>
                    </label>

                    <div className="flex justify-end gap-2">
                        <button type="button"
                                className="flex items-center justify-center font-semibold border border-gray-200 px-4 py-2 text-gray-700 rounded hover:bg-gray-100"
                                onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                                className="flex items-center justify-center font-semibold px-5 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">
                            <span>{saving ? 'Saving...' : 'Save'}</span>
                        </button>
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="text-sm font-medium text-red-600 mb-2">Danger zone</div>
                        <div className="flex flex-col items-start gap-3">
                            <button type="button" disabled={!confirmDelete} onClick={onDelete}
                                    className="px-4 py-2 rounded font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-40">
                                <i className="fa-solid fa-trash mr-2"></i>
                                Delete account
                            </button>
                            <label className="text-sm text-gray-600 flex items-center gap-2">
                                <input type="checkbox" checked={confirmDelete}
                                       onChange={(e) => setConfirmDelete(e.target.checked)}/>
                                I understand — delete my account permanently
                            </label>
                        </div>
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="text-sm font-medium mb-2">Blacklist</div>
                        <BlacklistManager onOpenProfile={onClose} />
                    </div>
                </form>
            </div>
        </div>
    );
}

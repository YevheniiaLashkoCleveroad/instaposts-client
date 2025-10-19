import {NavLink} from 'react-router';
import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {logoutUser} from '../store/slices/authSlice';
import {renderAvatar} from "../utils/renderAvatarHelper.jsx";
import CreatePostModal from "./CreatePostModal.jsx";

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.user);

    const [createOpen, setCreateOpen] = useState(false);

    const toggleSidebar = () => {
        setOpen((prev) => !prev);
    };

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <div className={`h-full shrink-0 sticky top-0 z-50 bg-gray-100 p-4 transition-[width] duration-300 ${open ? 'w-60' : 'w-20'} flex flex-col`}>
            <div className={`h-16 flex items-center mb-8 mt-2 ${open ? 'justify-between' : 'justify-center'}`}>
                <div
                    className={`flex justify-center items-center gap-2 transition-all logo ${!open && 'scale-0 hidden'}`}>
                    <img src="/title-font-logo.png" alt="Logo" className="h-16"/>
                    <div className="text-sm font-bold text-accent text-indigo-950 flex flex-col ml-1">
                        <span>Share</span>
                        <span>Your</span>
                        <span>World!</span>
                    </div>
                </div>
                <button onClick={toggleSidebar} className="text-gray-500 hover:text-gray-700">
                    <i className="fa-solid fa-bars text-xl"></i>
                </button>
            </div>

            <nav className="flex-1 min-h-0 flex flex-col justify-between">
                <div className="flex flex-col gap-2 overflow-y-auto">
                    <button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        className={`flex items-center text-gray-700 gap-2 py-2 px-3 hover:bg-gray-300 rounded ${!open && 'justify-center'}` }
                    >
                        <img src='/create-post.svg' alt="Create post" />
                        {open && 'Create Post'}
                    </button>

                    <NavLink to="/" className={({isActive}) => `flex items-center text-gray-700 gap-2 py-2 px-3 hover:bg-gray-300 rounded ${isActive && 'bg-gray-200'} ${!open && 'justify-center'}`}>
                        <i className="fa-solid fa-photo-film text-xl"></i>
                        {open && 'Feed'}
                    </NavLink>

                    <NavLink to="/users" className={({isActive}) => `flex items-center text-gray-700 gap-2 py-2 px-3 hover:bg-gray-300 rounded ${isActive && 'bg-gray-200'} ${!open && 'justify-center'}` }>
                        <i className="fa-solid fa-users text-xl"></i>
                        {open && 'Users'}
                    </NavLink>
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                    <NavLink to={`/users/${user?.id}`} className={({isActive}) => `flex items-center text-gray-700 gap-2 p-2 hover:bg-gray-300 rounded ${isActive && 'bg-gray-200'} ${!open && 'justify-center'}` }>
                        {renderAvatar(user, 33, null, 'text-sm')}
                        {open && 'My Profile'}
                    </NavLink>

                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-300 rounded text-indigo-700 ${!open && 'justify-center'}`}
                    >
                        <i className="fa-solid fa-right-from-bracket text-xl"></i>
                        {open && 'Logout'}
                    </button>
                </div>
            </nav>

            <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
        </div>
    );
};

export default Sidebar;

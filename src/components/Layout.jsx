import Sidebar from './Sidebar';
import { Outlet } from 'react-router';
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {fetchCurrentUser} from "../store/slices/authSlice.js";

const Layout = () => {
    const { token, user, loading } = useSelector((s) => s.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (token && !user && !loading) {
            dispatch(fetchCurrentUser());
        }
    }, [dispatch, token, user, loading]);

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-gray-50">
                <div className="relative z-10 p-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;

import {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {resendVerificationEmail} from '../store/slices/usersSlice';
import {Link} from "react-router";
import {logoutUser} from "../store/slices/authSlice.js";

export default function InfoPage() {
    const dispatch = useDispatch();
    const [cooldown, setCooldown] = useState(0);
    const [loading, setLoading] = useState(false);
    const timerRef = useRef(null);
    const {token} = useSelector(s => s.auth);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleResend = async () => {
        if (!token) return;
        setLoading(true);
        try {
            await dispatch(resendVerificationEmail()).unwrap();
            setCooldown(60);
            timerRef.current = setInterval(() => {
                setCooldown(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } finally {
            setLoading(false);
        }
    };

    const disabled = loading || cooldown > 0;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-6 text-center">
            <div className="text-indigo-500 text-6xl mb-4">
                <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            <h1 className="text-3xl font-semibold text-gray-800 mb-2">
                To view this page, you need to pass verification.
            </h1>

            <p className="text-gray-600 mt-6">
                Check your mail.{' '}
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={disabled}
                    className={`font-medium hover:underline disabled:opacity-60 disabled:cursor-not-allowed text-accent ${
                        disabled ? 'text-gray-500' : 'text-indigo-600'
                    }`}
                    aria-busy={loading ? 'true' : 'false'}
                >
                    {loading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Or request a new verification email.'}
                </button>
                .
            </p>

            <Link
                to="/"
                className="mt-6 inline-flex text-accent font-semibold items-center px-5 py-2.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition text-sm"
            >
                <i className="fa-solid fa-arrow-left mr-2 mt-0.5"></i>
                Go back home
            </Link>

            <button
                onClick={handleLogout}
                className="mt-6 inline-flex text-accent font-semibold items-center px-5 py-2.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition text-sm"
            >
                <i className="fa-solid fa-right-from-bracket mr-2 mt-0.5"></i>
                Logout
            </button>
        </div>
    );
}

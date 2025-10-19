import {useEffect, useRef, useState} from 'react';
import {Link, useSearchParams} from 'react-router';
import {useDispatch, useSelector} from 'react-redux';
import {verifyEmail, resendVerificationEmail} from '../store/slices/usersSlice';
import {fetchCurrentUser, logoutUser} from '../store/slices/authSlice';

export default function VerifyPage() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';

    const {verifying} = useSelector(s => s.users);
    const [status, setStatus] = useState('idle');
    const [cooldown, setCooldown] = useState(0);
    const [resending, setResending] = useState(false);
    const timerRef = useRef(null);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    useEffect(() => {
        if (!token) {
            setStatus('missing');
            return;
        }

        const thunk = dispatch(verifyEmail(token));
        thunk.unwrap()
            .then(async () => {
                setStatus('ok');
                await dispatch(fetchCurrentUser());
            })
            .catch(() => setStatus('error'));

        return () => thunk.abort();
    }, [token, dispatch]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const handleResend = async () => {
        if (resending || cooldown > 0) return;
        setResending(true);
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
            setResending(false);
        }
    };

    const resendDisabled = resending || cooldown > 0;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-6 text-center">
            <h1 className="text-3xl text-indigo-700 text-accent">Email verification</h1>

            <div className="mt-4 text-gray-700">
                {verifying && status === 'idle' && <p>Verifying...</p>}
                {status === 'missing' && (
                    <p>
                        Token is missing.{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendDisabled}
                            className={`font-medium hover:underline text-accent disabled:opacity-60 disabled:cursor-not-allowed ${
                                resendDisabled ? 'text-gray-500' : 'text-indigo-600'
                            }`}
                            aria-busy={resending ? 'true' : 'false'}
                        >
                            {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Request a new verification email'}
                        </button>
                        .
                    </p>
                )}

                {status === 'ok' && (
                    <p>
                        Verified!
                    </p>
                )}

                {status === 'error' && (
                    <p>
                        Invalid or expired link.{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendDisabled}
                            className={`font-medium hover:underline disabled:opacity-60 text-accent disabled:cursor-not-allowed ${
                                resendDisabled ? 'text-gray-500' : 'text-indigo-600'
                            }`}
                            aria-busy={resending ? 'true' : 'false'}
                        >
                            {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification email'}
                        </button>
                        .
                    </p>
                )}
            </div>

            <Link
                to="/"
                className="mt-6 inline-flex text-accent font-semibold items-center px-5 py-2.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition text-sm"
            >
                <i className="fa-solid fa-arrow-left mr-2 mt-1"></i>
                Go back home
            </Link>

            <button
                onClick={handleLogout}
                className="mt-6 inline-flex text-accent font-semibold items-center px-5 py-2.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition text-sm"
            >
                <i className="fa-solid fa-right-from-bracket text-xl"></i>
                Logout
            </button>
        </div>
    );
}

import {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {loginUser} from '../store/slices/authSlice';
import {Link} from "react-router";

const LoginForm = () => {
    const dispatch = useDispatch();
    const {loading, error} = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({email: '', password: ''});

    const handleChange = (e) => {
        setFormData((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser(formData));
    };

    return (
        <div className="flex items-center justify-center w-full h-full">
            <div className='bg-white p-6 rounded border border-gray-200 w-full max-w-md'>
                <div className="flex justify-center mt-4 logo">
                    <img src="/logo.png" alt="Logo" className="h-20"/>
                </div>

                <h2 className="text-2xl mt-6 text-center font-semibold text-accent">Sign in to your account</h2>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">

                    <div>
                        <div className="relative mt-1">
                            <i className="fa-solid fa-envelope absolute left-3 top-3 text-gray-400"></i>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-10 p-2 w-full rounded border border-gray-300 focus:outline focus:outline-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative mt-1">
                            <i className="fa-solid fa-lock absolute left-3 top-3 text-gray-400"></i>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                className="pl-10 p-2 w-full rounded border border-gray-300 focus:outline focus:outline-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-500 text-accent text-white font-bold py-2 mt-2 rounded hover:bg-indigo-700 transition"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-500 text-accent hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;

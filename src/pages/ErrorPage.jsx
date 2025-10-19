import { Link } from 'react-router';

const ErrorPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-6 text-center">
            <div className="text-indigo-500 text-6xl mb-4">
                <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            <h1 className="text-7xl font-semibold text-accent text-indigo-500 mb-2">
                404
            </h1>
            <h1 className="text-3xl font-semibold text-accent text-gray-800 mb-2">
                Oops! Something went wrong...
            </h1>
            <p className="text-gray-600 text-sm mb-6">
                This page doesn’t exist or an unexpected error has occurred.
            </p>

            <Link
                to="/"
                className="inline-flex text-accent font-semibold items-center px-5 py-2.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition text-sm"
            >
                <i className="fa-solid fa-arrow-left mr-2 mt-1"></i>
                Go back home
            </Link>
        </div>
    );
};

export default ErrorPage;

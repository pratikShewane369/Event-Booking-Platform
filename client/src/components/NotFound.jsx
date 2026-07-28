    import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
            <h1 className="text-8xl font-extrabold text-blue-600">404</h1>

            <h2 className="mt-4 text-3xl font-bold text-gray-800">
                Oops! Page Not Found
            </h2>

            <p className="mt-3 text-gray-600 max-w-md">
                The page you're looking for doesn't exist, may have been moved,
                or the URL is incorrect.
            </p>

            <Link
                to="/"
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-300"
            >
                Go Back Home
            </Link>
        </div>
    );
};

export default NotFound;
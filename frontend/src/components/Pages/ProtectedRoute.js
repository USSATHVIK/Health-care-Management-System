import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, requiredRole = null }) => {
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role');

            if (!token) {
                setIsValid(false);
                setLoading(false);
                return;
            }

            // If requiredRole is specified, check if user has that role
            if (requiredRole) {
                // Case-insensitive role comparison
                if (role?.toLowerCase() === requiredRole.toLowerCase() || role?.toLowerCase() === 'admin') {
                    setIsValid(true);
                } else {
                    setIsValid(false);
                }
            } else {
                // Just check if token exists
                setIsValid(true);
            }

            setLoading(false);
        };

        checkAuth();
    }, [requiredRole]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (!isValid) {
        return <Navigate to="/login" />;
    }

    return element;
};

export default ProtectedRoute;



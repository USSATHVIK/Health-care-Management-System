import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
 
// Sidebar Component (for Doctor Dashboard)
const Sidebar = () => (
    <motion.div
        className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between transform transition-all duration-300"
        initial={{ opacity: 0, x: -250 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex items-center space-x-4 mb-6">
            <img
                src="https://via.placeholder.com/40"
                alt="Profile"
                className="rounded-full w-10 h-10"
            />
            <span className="text-lg font-semibold text-teal-600">Doctor Name</span>
        </div>

        <ul className="space-y-4">
            {/* Doctor Dashboard Sidebar Links */}
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor" className="text-teal-600">Dashboard Overview</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/manage-policies" className="text-teal-600">Manage Policies</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/manage-users" className="text-teal-600">Manage Users</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/manage-claims" className="text-teal-600">Manage Claims</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/view-claims" className="text-teal-600">View Claims</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/view-reports" className="text-teal-600">View Reports</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/view-compliance" className="text-teal-600">Compliance</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/system-settings" className="text-teal-600">System Settings</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/claim-submission" className="text-teal-600">Review</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/track-claim-status" className="text-teal-600">Track Claim Status</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/smart-contract-interaction" className="text-teal-600">Smart Contract</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/activity-log" className="text-teal-600">Activity Logs</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/secure-communication" className="text-teal-600">Secure Communication</Link>
            </li>
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
                <Link to="/dashboard/doctor/patient-information" className="text-teal-600">Patient Information</Link>
            </li>
        </ul>
    </motion.div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalClaims: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
        fetchStats();
    }, []);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Get user info from token or make API call
            // For now, we'll use the user data stored in localStorage if available
            const userData = localStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = {
            'Authorization': `Bearer ${token}`
        };

        try {
            const [
                pendingResult,
                approvedResult,
                rejectedResult,
                usersResult
            ] = await Promise.allSettled([
                axios.get('http://localhost:5001/api/claims/pending/pending', { headers }),
                axios.get('http://localhost:5001/api/claims/approved', { headers }),
                axios.get('http://localhost:5001/api/claims/rejected', { headers }),
                axios.get('http://localhost:5001/api/users', { headers })
            ]);

            const pendingClaims =
                pendingResult.status === 'fulfilled' &&
                Array.isArray(pendingResult.value.data?.pendingClaims)
                    ? pendingResult.value.data.pendingClaims
                    : [];

            const approvedClaims =
                approvedResult.status === 'fulfilled' &&
                Array.isArray(approvedResult.value.data)
                    ? approvedResult.value.data
                    : [];

            const rejectedClaims =
                rejectedResult.status === 'fulfilled' &&
                Array.isArray(rejectedResult.value.data)
                    ? rejectedResult.value.data
                    : [];

            const totalUsers =
                usersResult.status === 'fulfilled' &&
                Array.isArray(usersResult.value.data)
                    ? usersResult.value.data.length
                    : stats.totalUsers;

            const pendingCount = pendingClaims.filter(
                (claim) => claim.status === 'pending' || claim.status === 'under review'
            ).length;

            const approvedCount = approvedClaims.length;
            const rejectedCount = rejectedClaims.length;

            setStats((prev) => ({
                ...prev,
                totalClaims: pendingCount + approvedCount + rejectedCount,
                pendingClaims: pendingCount,
                approvedClaims: approvedCount,
                rejectedClaims: rejectedCount,
                totalUsers
            }));

            if (usersResult.status === 'rejected') {
                console.error('Error fetching users:', usersResult.reason);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Logout handler
    const LogoutHandler = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        navigate('/login');  // redirect to login
    };

    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Doctor';
    const userEmail = user?.email || '';

    return (
        <div className="flex min-h-screen bg-gradient-to-r from-teal-400 to-blue-500">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 p-8">
                {/* Top Navbar */}
                <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg mb-6">
                    {/* Profile Section */}
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-teal-600 block">{userName}</span>
                            {userEmail && <span className="text-sm text-gray-500">{userEmail}</span>}
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
                        onClick={LogoutHandler}
                    >
                        Logout
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Claims</h3>
                        <p className="text-3xl font-bold text-teal-600">{stats.totalClaims}</p>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Claims</h3>
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingClaims}</p>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Approved Claims</h3>
                        <p className="text-3xl font-bold text-green-600">{stats.approvedClaims}</p>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                    >
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                    </motion.div>
                </div>

                {/* Main Dashboard Content */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                >
                    {/* Manage Users Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        onClick={() => navigate('/dashboard/doctor/manage-users')}
                    >
                        <h3 className="text-2xl font-bold text-teal-600 mb-4">Manage Users</h3>
                        <p className="text-gray-600 mb-4">Control and edit user accounts.</p>
                        <Link to="/dashboard/doctor/manage-users" className="text-teal-600 hover:text-teal-700 transition font-medium">
                            Go to User Management →
                        </Link>
                    </motion.div>

                    {/* Manage Claims Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        onClick={() => navigate('/dashboard/doctor/manage-claims')}
                    >
                        <h3 className="text-2xl font-bold text-teal-600 mb-4">Manage Claims</h3>
                        <p className="text-gray-600 mb-4">Handle claim submissions and updates.</p>
                        <Link to="/dashboard/doctor/manage-claims" className="text-teal-600 hover:text-teal-700 transition font-medium">
                            Manage Claims →
                        </Link>
                    </motion.div>

                    {/* Review Claims Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        onClick={() => navigate('/dashboard/doctor/claim-submission')}
                    >
                        <h3 className="text-2xl font-bold text-teal-600 mb-4">Review Claims</h3>
                        <p className="text-gray-600 mb-4">Review and approve/reject pending claims.</p>
                        <Link to="/dashboard/doctor/claim-submission" className="text-teal-600 hover:text-teal-700 transition font-medium">
                            Review Claims →
                        </Link>
                    </motion.div>

                    {/* View Claims Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        onClick={() => navigate('/dashboard/doctor/view-claims')}
                    >
                        <h3 className="text-2xl font-bold text-teal-600 mb-4">View Claims</h3>
                        <p className="text-gray-600 mb-4">View all claims with details.</p>
                        <Link to="/dashboard/doctor/view-claims" className="text-teal-600 hover:text-teal-700 transition font-medium">
                            View Claims →
                        </Link>
                    </motion.div>

                    {/* View Reports Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        onClick={() => navigate('/dashboard/doctor/view-reports')}
                    >
                        <h3 className="text-2xl font-bold text-teal-600 mb-4">View Reports</h3>
                        <p className="text-gray-600 mb-4">Review system and user reports.</p>
                        <Link to="/dashboard/doctor/view-reports" className="text-teal-600 hover:text-teal-700 transition font-medium">
                            View Reports →
                        </Link>
                    </motion.div>

                    {/* Activity Log Card */}
                    <motion.div
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 100 }}
                        onClick={() => navigate('/dashboard/doctor/activity-log')}
                    >
                        <h3 className="text-2xl font-bold text-teal-600 mb-4">Activity Log</h3>
                        <p className="text-gray-600 mb-4">View system activity and logs.</p>
                        <Link to="/dashboard/doctor/activity-log" className="text-teal-600 hover:text-teal-700 transition font-medium">
                            View Activity →
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;

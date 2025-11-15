import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                message.error('Please login to view users');
                navigate('/login');
                return;
            }

            // Fetch users from the backend
            const response = await axios.get('http://localhost:5001/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && Array.isArray(response.data)) {
                // Transform the data to include user details
                const transformedUsers = response.data.map(userMgmt => ({
                    id: userMgmt.user?._id || userMgmt._id,
                    firstName: userMgmt.user?.firstName || '',
                    lastName: userMgmt.user?.lastName || '',
                    email: userMgmt.user?.email || '',
                    role: userMgmt.role || userMgmt.user?.role || 'user',
                    status: userMgmt.isActive ? 'Active' : 'Inactive',
                    isActive: userMgmt.isActive
                }));
                setUsers(transformedUsers);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.response?.data?.message || 'Failed to fetch users');
            message.error(error.response?.data?.message || 'Failed to fetch users');
            
            // If unauthorized, redirect to login
            if (error.response?.status === 401 || error.response?.status === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (userId) => {
        navigate(`/dashboard/doctor/edit-user/${userId}`);
    };

    const handleDeactivateUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Please login to perform this action');
                navigate('/login');
                return;
            }

            const response = await axios.put(
                `http://localhost:5001/api/users/${userId}/deactivate`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                message.success('User deactivated successfully');
                fetchUsers(); // Refresh the user list
            }
        } catch (error) {
            console.error('Error deactivating user:', error);
            message.error(error.response?.data?.message || 'Failed to deactivate user');
        }
    };

    const handleActivateUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Please login to perform this action');
                navigate('/login');
                return;
            }

            const response = await axios.put(
                `http://localhost:5001/api/users/${userId}/activate`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                message.success('User activated successfully');
                fetchUsers(); // Refresh the user list
            }
        } catch (error) {
            console.error('Error activating user:', error);
            message.error(error.response?.data?.message || 'Failed to activate user');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Please login to perform this action');
                navigate('/login');
                return;
            }

            const response = await axios.put(
                `http://localhost:5001/api/users/${userId}/role`,
                { role: newRole },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                message.success('User role updated successfully');
                fetchUsers(); // Refresh the user list
            }
        } catch (error) {
            console.error('Error changing user role:', error);
            message.error(error.response?.data?.message || 'Failed to change user role');
        }
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-teal-600">Manage Users</h2>
                <button
                    onClick={fetchUsers}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
                >
                    Refresh
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {users.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No users found</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-teal-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-teal-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.firstName} {user.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="approver">Approver</option>
                                                <option value="auditor">Auditor</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                                    user.status === 'Active'
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-red-500 text-white'
                                                }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user.id)}
                                                    className="text-teal-600 hover:text-teal-800 font-medium"
                                                >
                                                    Edit
                                                </button>
                                                {user.isActive ? (
                                                    <button
                                                        onClick={() => handleDeactivateUser(user.id)}
                                                        className="text-red-600 hover:text-red-800 font-medium"
                                                    >
                                                        Deactivate
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleActivateUser(user.id)}
                                                        className="text-green-600 hover:text-green-800 font-medium"
                                                    >
                                                        Activate
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;

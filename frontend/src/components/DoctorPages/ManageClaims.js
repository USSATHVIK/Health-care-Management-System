// components/DoctorPages/ManageClaims.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

function ManageClaims() {
    const [claims, setClaims] = useState([]);
    const [approvedClaims, setApprovedClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
    const navigate = useNavigate();

    useEffect(() => {
        if (activeTab === 'pending') {
            fetchClaims();
        } else {
            fetchApprovedClaims();
        }
    }, [filterStatus, activeTab]);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                message.error('Please login to view claims');
                navigate('/login');
                return;
            }

            // Fetch all claims
            const response = await axios.get('http://localhost:5001/api/claims/pending/pending?stage=doctor', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.pendingClaims) {
                let filteredClaims = response.data.pendingClaims;
                
                // Filter by status if not 'all'
                if (filterStatus !== 'all') {
                    filteredClaims = filteredClaims.filter(claim => 
                        claim.status.toLowerCase() === filterStatus.toLowerCase()
                    );
                }
                
                setClaims(filteredClaims);
            } else if (response.data && response.data.message) {
                // No claims message
                setClaims([]);
            } else {
                // Try to fetch all claims from another endpoint
                try {
                    const allClaimsResponse = await axios.get('http://localhost:5001/api/claims', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (allClaimsResponse.data) {
                        let allClaims = Array.isArray(allClaimsResponse.data) 
                            ? allClaimsResponse.data 
                            : [];
                        if (filterStatus !== 'all') {
                            allClaims = allClaims.filter(claim => 
                                claim.status && claim.status.toLowerCase() === filterStatus.toLowerCase()
                            );
                        }
                        setClaims(allClaims);
                    }
                } catch (err) {
                    console.error('Error fetching all claims:', err);
                    setClaims([]);
                }
            }
        } catch (error) {
            console.error('Error fetching claims:', error);
            setError(error.response?.data?.error || 'Failed to fetch claims');
            message.error(error.response?.data?.error || 'Failed to fetch claims');
        } finally {
            setLoading(false);
        }
    };

    const fetchApprovedClaims = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                message.error('Please login to view claims');
                navigate('/login');
                return;
            }

            // Fetch doctor-approved claims with insurer decisions
            const response = await axios.get('http://localhost:5001/api/claims/pending/doctor-approved', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data && response.data.approvedClaims) {
                let filteredClaims = response.data.approvedClaims;
                
                // Filter by insurer status if not 'all'
                if (filterStatus !== 'all') {
                    filteredClaims = filteredClaims.filter(claim => 
                        claim.insurerApprovalStatus.toLowerCase() === filterStatus.toLowerCase()
                    );
                }
                
                setApprovedClaims(filteredClaims);
            } else {
                setApprovedClaims([]);
            }
        } catch (error) {
            console.error('Error fetching approved claims:', error);
            setError(error.response?.data?.error || 'Failed to fetch approved claims');
            message.error(error.response?.data?.error || 'Failed to fetch approved claims');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (claimId) => {
        navigate(`/dashboard/doctor/view-claims?claimId=${claimId}`);
    };

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase();
        if (statusLower === 'approved') return 'bg-green-500';
        if (statusLower === 'pending' || statusLower === 'under review') return 'bg-yellow-500';
        if (statusLower === 'rejected') return 'bg-red-500';
        return 'bg-gray-500';
    };

    const formatAmount = (amount) => {
        if (typeof amount === 'number') {
            return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return amount || 'N/A';
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading claims...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-teal-600">Manage Claims</h2>
                <button
                    onClick={() => activeTab === 'pending' ? fetchClaims() : fetchApprovedClaims()}
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
                >
                    Refresh
                </button>
            </div>

            {/* Tab Section */}
            <div className="mb-6 flex gap-2 border-b border-gray-300">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 font-semibold transition ${
                        activeTab === 'pending'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Pending Claims
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`px-6 py-3 font-semibold transition ${
                        activeTab === 'approved'
                            ? 'text-teal-600 border-b-2 border-teal-600'
                            : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                    Approved Claims (with Insurer Decision)
                </button>
            </div>

            {/* Filter Section */}
            <div className="mb-6 flex gap-4">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg ${
                        filterStatus === 'all' 
                            ? 'bg-teal-600 text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    All
                </button>
                {activeTab === 'pending' ? (
                    <>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-2 rounded-lg ${
                                filterStatus === 'pending' 
                                    ? 'bg-teal-600 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Pending
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setFilterStatus('approved')}
                            className={`px-4 py-2 rounded-lg ${
                                filterStatus === 'approved' 
                                    ? 'bg-teal-600 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Approved by Insurer
                        </button>
                        <button
                            onClick={() => setFilterStatus('rejected')}
                            className={`px-4 py-2 rounded-lg ${
                                filterStatus === 'rejected' 
                                    ? 'bg-teal-600 text-white' 
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            Rejected by Insurer
                        </button>
                    </>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {activeTab === 'pending' ? (
                // Pending Claims Tab
                claims.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No pending claims found</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {claims.map((claim) => (
                            <div
                                key={claim.claimId || claim._id}
                                className="p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition-all duration-300"
                            >
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Claim ID</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {claim.claimId || 'N/A'}
                                    </p>
                                </div>
                                
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Patient</p>
                                    <p className="text-lg font-semibold text-teal-600">
                                        {claim.patientName || claim.claimant || 'N/A'}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Doctor</p>
                                    <p className="text-gray-700">
                                        {claim.doctorName || 'N/A'}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {formatAmount(claim.amount)}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-white text-sm ${getStatusColor(claim.status)}`}
                                    >
                                        {claim.status || 'N/A'}
                                    </span>
                                </div>

                                {claim.description && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Description</p>
                                        <p className="text-gray-700 text-sm line-clamp-2">
                                            {claim.description}
                                        </p>
                                    </div>
                                )}

                                {claim.submissionDate && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Submission Date</p>
                                        <p className="text-gray-700 text-sm">
                                            {new Date(claim.submissionDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleViewDetails(claim.claimId || claim._id)}
                                    className="mt-4 w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                // Approved Claims Tab (with Insurer Decision)
                approvedClaims.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No approved claims found</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {approvedClaims.map((claim) => (
                            <div
                                key={claim.claimId || claim._id}
                                className="p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition-all duration-300 border-l-4 border-teal-600"
                            >
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Claim ID</p>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {claim.claimId || 'N/A'}
                                    </p>
                                </div>
                                
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Patient</p>
                                    <p className="text-lg font-semibold text-teal-600">
                                        {claim.patientName || claim.claimant || 'N/A'}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Amount</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {formatAmount(claim.amount)}
                                    </p>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Your Approval</p>
                                    <span className="inline-block px-3 py-1 rounded-full text-white text-sm bg-green-500">
                                        Approved
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-gray-500">Insurer Decision</p>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-white text-sm ${
                                            claim.insurerApprovalStatus === 'approved' 
                                                ? 'bg-green-500' 
                                                : claim.insurerApprovalStatus === 'rejected'
                                                ? 'bg-red-500'
                                                : 'bg-yellow-500'
                                        }`}
                                    >
                                        {claim.insurerApprovalStatus?.charAt(0).toUpperCase() + claim.insurerApprovalStatus?.slice(1) || 'N/A'}
                                    </span>
                                </div>

                                {claim.rejectionReason && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Rejection Reason</p>
                                        <p className="text-gray-700 text-sm">
                                            {claim.rejectionReason}
                                        </p>
                                    </div>
                                )}

                                {claim.insurerReviewedAt && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-500">Insurer Review Date</p>
                                        <p className="text-gray-700 text-sm">
                                            {new Date(claim.insurerReviewedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleViewDetails(claim.claimId || claim._id)}
                                    className="mt-4 w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

export default ManageClaims;

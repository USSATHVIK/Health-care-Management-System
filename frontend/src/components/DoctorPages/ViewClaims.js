import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';

function ViewClaims() {
    const [claims, setClaims] = useState([]);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const claimIdParam = searchParams.get('claimId');

    useEffect(() => {
        fetchClaims();
    }, []);

    useEffect(() => {
        if (claimIdParam) {
            fetchClaimDetails(claimIdParam);
        }
    }, [claimIdParam]);

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
                setClaims(response.data.pendingClaims);
            } else if (response.data && response.data.message) {
                setClaims([]);
            } else {
                setClaims([]);
            }
        } catch (error) {
            console.error('Error fetching claims:', error);
            setError(error.response?.data?.error || 'Failed to fetch claims');
            message.error(error.response?.data?.error || 'Failed to fetch claims');
        } finally {
            setLoading(false);
        }
    };

    const fetchClaimDetails = async (claimId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Try to fetch the claim details
            try {
                const response = await axios.get(`http://localhost:5001/api/claims/pending/claim/${claimId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data) {
                    setSelectedClaim(response.data);
                    return;
                }
            } catch (error) {
                console.warn('Claim not found in pending claims, trying approved claims...');
            }

            // If not found in pending, try fetching from all claims
            try {
                const allClaimsResponse = await axios.get(`http://localhost:5001/api/claims`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (allClaimsResponse.data && Array.isArray(allClaimsResponse.data)) {
                    const claim = allClaimsResponse.data.find(c => c.claimId === claimId || c._id === claimId);
                    if (claim) {
                        setSelectedClaim(claim);
                        return;
                    }
                }
            } catch (error) {
                console.warn('Error fetching from all claims:', error);
            }

            message.error('Claim not found');
        } catch (error) {
            console.error('Error fetching claim details:', error);
            message.error('Failed to fetch claim details');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const statusLower = status?.toLowerCase();
        if (statusLower === 'approved') return 'bg-green-500 text-white';
        if (statusLower === 'pending' || statusLower === 'under review') return 'bg-yellow-500 text-white';
        if (statusLower === 'rejected') return 'bg-red-500 text-white';
        return 'bg-gray-500 text-white';
    };

    const formatAmount = (amount) => {
        if (typeof amount === 'number') {
            return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return amount || 'N/A';
    };

    if (loading && !selectedClaim) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading claims...</p>
                </div>
            </div>
        );
    }

    // Show claim details if a specific claim is selected
    if (selectedClaim) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="mb-4">
                    <button
                        onClick={() => {
                            setSelectedClaim(null);
                            navigate('/dashboard/doctor/view-claims');
                        }}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
                    >
                        ← Back to Claims List
                    </button>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold text-teal-600 mb-6">Claim Details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Claim ID</p>
                            <p className="text-lg font-semibold">{selectedClaim.claimId || 'N/A'}</p>
                        </div>
                        
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(selectedClaim.status)}`}>
                                {selectedClaim.status || 'N/A'}
                            </span>
                        </div>
                        
                        <div>
                            <p className="text-sm text-gray-500">Patient Name</p>
                            <p className="text-lg font-semibold text-teal-600">
                                {selectedClaim.patientName || 'N/A'}
                            </p>
                        </div>
                        
                        <div>
                            <p className="text-sm text-gray-500">Doctor Name</p>
                            <p className="text-lg">{selectedClaim.doctorName || 'N/A'}</p>
                        </div>
                        
                        <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="text-lg font-bold">{formatAmount(selectedClaim.amount)}</p>
                        </div>
                        
                        {selectedClaim.submissionDate && (
                            <div>
                                <p className="text-sm text-gray-500">Submission Date</p>
                                <p className="text-lg">
                                    {new Date(selectedClaim.submissionDate).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                        
                        {selectedClaim.transactionHash && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Transaction Hash</p>
                                <p className="text-sm font-mono break-all">{selectedClaim.transactionHash}</p>
                            </div>
                        )}
                        
                        {selectedClaim.description && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="text-gray-700">{selectedClaim.description}</p>
                            </div>
                        )}

                        {selectedClaim.doctorApprovalStatus && (
                            <div>
                                <p className="text-sm text-gray-500">Doctor Approval Status</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedClaim.doctorApprovalStatus === 'approved' ? 'bg-green-500 text-white' :
                                    selectedClaim.doctorApprovalStatus === 'rejected' ? 'bg-red-500 text-white' :
                                    'bg-yellow-500 text-white'
                                }`}>
                                    {selectedClaim.doctorApprovalStatus?.charAt(0).toUpperCase() + selectedClaim.doctorApprovalStatus?.slice(1)}
                                </span>
                            </div>
                        )}

                        {selectedClaim.insurerApprovalStatus && (
                            <div>
                                <p className="text-sm text-gray-500">Insurer Decision</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    selectedClaim.insurerApprovalStatus === 'approved' ? 'bg-green-500 text-white' :
                                    selectedClaim.insurerApprovalStatus === 'rejected' ? 'bg-red-500 text-white' :
                                    'bg-yellow-500 text-white'
                                }`}>
                                    {selectedClaim.insurerApprovalStatus?.charAt(0).toUpperCase() + selectedClaim.insurerApprovalStatus?.slice(1)}
                                </span>
                            </div>
                        )}

                        {selectedClaim.rejectionReason && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Rejection Reason</p>
                                <p className="text-gray-700">{selectedClaim.rejectionReason}</p>
                            </div>
                        )}

                        {selectedClaim.doctorReview && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Doctor Review</p>
                                <p className="text-gray-700">{selectedClaim.doctorReview}</p>
                            </div>
                        )}
                        
                        {selectedClaim.documents && selectedClaim.documents.length > 0 && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500 mb-2">Documents</p>
                                <div className="space-y-2">
                                    {selectedClaim.documents.map((doc, index) => (
                                        <div key={index} className="p-3 bg-gray-100 rounded">
                                            <a
                                                href={doc.fileUrl || `https://gateway.pinata.cloud/ipfs/${doc.ipfsHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-teal-600 hover:underline"
                                            >
                                                {doc.fileType || 'Document'} - View
                                            </a>
                                            {doc.ipfsHash && (
                                                <p className="text-xs text-gray-500 mt-1">IPFS: {doc.ipfsHash}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-teal-600">View Claims</h2>
                <button
                    onClick={fetchClaims}
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

            {claims.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">No claims found</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                            <thead className="bg-teal-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Claim ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Patient Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Doctor Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Submission Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {claims.map((claim) => (
                                    <tr key={claim.claimId || claim._id} className="hover:bg-teal-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {claim.claimId || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {claim.patientName || claim.claimant || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {claim.doctorName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {formatAmount(claim.amount)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                                                {claim.status || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {claim.submissionDate 
                                                ? new Date(claim.submissionDate).toLocaleDateString()
                                                : 'N/A'
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => {
                                                    setSelectedClaim(claim);
                                                    navigate(`/dashboard/doctor/view-claims?claimId=${claim.claimId || claim._id}`);
                                                }}
                                                className="text-teal-600 hover:text-teal-800 font-medium"
                                            >
                                                View Details
                                            </button>
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

export default ViewClaims;

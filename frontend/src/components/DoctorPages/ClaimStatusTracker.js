import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

const ClaimStatusTracker = () => {
    const [claimId, setClaimId] = useState('');
    const [claimDetails, setClaimDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Function to track claim status via backend API
    const handleTrackStatus = async () => {
        if (!claimId.trim()) {
            message.error('Please enter a claim ID.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            
            console.log('Searching for claim ID:', claimId);

            // Fetch the claim status from the backend API
            const response = await axios.get(`http://localhost:5001/api/claim-tracker/${claimId}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            console.log('Claim found:', response.data);

            if (response.data) {
                setClaimDetails(response.data);
                message.success('Claim found!');
            } else {
                setError('Claim not found!');
                message.error('Claim not found!');
            }
        } catch (error) {
            console.error('Error fetching claim status:', error);
            
            let errorMsg = 'Error fetching claim status. Please try again.';
            
            if (error.response?.status === 404) {
                errorMsg = 'Claim not found. Please check the claim ID.';
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (!error.response) {
                errorMsg = 'Cannot connect to server. Make sure backend is running on port 5001.';
            }
            
            setError(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Track Claim Status</h2>
            <input
                type="text"
                className="w-full p-2 border rounded mb-4"
                placeholder="Enter Claim ID"
                value={claimId}
                onChange={(e) => setClaimId(e.target.value)}
            />
            <button
                onClick={handleTrackStatus}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                disabled={loading}
            >
                {loading ? 'Tracking...' : 'Track Status'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <p>{error}</p>
                </div>
            )}

            {claimDetails && !loading && (
                <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-teal-600 mb-4">Claim Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Claim ID</p>
                            <p className="font-semibold text-gray-800">{claimDetails.claimId || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${
                                claimDetails.status === 'approved' ? 'bg-green-500' :
                                claimDetails.status === 'rejected' ? 'bg-red-500' :
                                claimDetails.status === 'pending' ? 'bg-yellow-500' :
                                'bg-blue-500'
                            }`}>
                                {claimDetails.status?.charAt(0).toUpperCase() + claimDetails.status?.slice(1) || 'N/A'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Patient Name</p>
                            <p className="font-semibold text-gray-800">{claimDetails.patientName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Amount</p>
                            <p className="font-semibold text-gray-800">
                                {claimDetails.amount ? `₹${claimDetails.amount.toLocaleString('en-IN')}` : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Current Stage</p>
                            <p className="font-semibold text-gray-800">
                                {claimDetails.currentStage?.charAt(0).toUpperCase() + claimDetails.currentStage?.slice(1) || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Submission Date</p>
                            <p className="font-semibold text-gray-800">
                                {claimDetails.submissionDate ? new Date(claimDetails.submissionDate).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        {claimDetails.doctorApprovalStatus && (
                            <div>
                                <p className="text-sm text-gray-500">Doctor Approval</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${
                                    claimDetails.doctorApprovalStatus === 'approved' ? 'bg-green-500' :
                                    claimDetails.doctorApprovalStatus === 'rejected' ? 'bg-red-500' :
                                    'bg-yellow-500'
                                }`}>
                                    {claimDetails.doctorApprovalStatus?.charAt(0).toUpperCase() + claimDetails.doctorApprovalStatus?.slice(1)}
                                </span>
                            </div>
                        )}
                        {claimDetails.insurerApprovalStatus && (
                            <div>
                                <p className="text-sm text-gray-500">Insurer Decision</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${
                                    claimDetails.insurerApprovalStatus === 'approved' ? 'bg-green-500' :
                                    claimDetails.insurerApprovalStatus === 'rejected' ? 'bg-red-500' :
                                    'bg-yellow-500'
                                }`}>
                                    {claimDetails.insurerApprovalStatus?.charAt(0).toUpperCase() + claimDetails.insurerApprovalStatus?.slice(1)}
                                </span>
                            </div>
                        )}
                        {claimDetails.rejectionReason && (
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Rejection Reason</p>
                                <p className="text-gray-700">{claimDetails.rejectionReason}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimStatusTracker;

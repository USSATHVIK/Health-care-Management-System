// src/components/DoctorDashboard/PatientInformation.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';

const PatientInformation = () => {
    const [patientData, setPatientData] = useState(null);
    const [patientClaims, setPatientClaims] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const patientId = searchParams.get('patientId');
    const [patientIdInput, setPatientIdInput] = useState(patientId || '');

    useEffect(() => {
        if (patientId) {
            fetchPatientData(patientId);
        }
    }, [patientId]);

    const fetchPatientData = async (id) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            if (!token) {
                message.error('Please login to view patient information');
                navigate('/login');
                return;
            }

            // Fetch user data
            const userResponse = await axios.get(`http://localhost:5001/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Find the patient by ID
            const users = userResponse.data || [];
            const patient = users.find(u => u.user?._id === id || u._id === id);
            
            if (patient && patient.user) {
                setPatientData({
                    id: patient.user._id,
                    firstName: patient.user.firstName,
                    lastName: patient.user.lastName,
                    email: patient.user.email,
                    role: patient.user.role || patient.role,
                    status: patient.isActive ? 'Active' : 'Inactive'
                });
            } else {
                setError('Patient not found');
                message.error('Patient not found');
            }

            // Fetch patient claims
            try {
                const claimsResponse = await axios.get('http://localhost:5001/api/claims/pending/pending?stage=all', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (claimsResponse.data && claimsResponse.data.pendingClaims) {
                    const patientClaimsList = claimsResponse.data.pendingClaims.filter(
                        claim => claim.patientId === id
                    );
                    setPatientClaims(patientClaimsList);
                }
            } catch (error) {
                console.error('Error fetching patient claims:', error);
            }

        } catch (error) {
            console.error('Error fetching patient data:', error);
            setError(error.response?.data?.message || 'Failed to fetch patient information');
            message.error(error.response?.data?.message || 'Failed to fetch patient information');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (patientIdInput.trim()) {
            fetchPatientData(patientIdInput.trim());
            navigate(`/dashboard/doctor/patient-information?patientId=${patientIdInput.trim()}`);
        } else {
            message.error('Please enter a patient ID');
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-teal-600 mb-6">Patient Information</h2>
            
            {/* Search Section */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={patientIdInput}
                        onChange={(e) => setPatientIdInput(e.target.value)}
                        placeholder="Enter Patient ID"
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Search'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            )}

            {patientData && !loading && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4">Patient Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-lg font-semibold text-teal-600">
                                {patientData.firstName} {patientData.lastName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-lg">{patientData.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Role</p>
                            <p className="text-lg">{patientData.role}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Status</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                                patientData.status === 'Active'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                            }`}>
                                {patientData.status}
                            </span>
                        </div>
                    </div>

                    {/* Patient Claims */}
                    {patientClaims.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-4">Patient Claims</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full table-auto">
                                    <thead className="bg-teal-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Claim ID</th>
                                            <th className="px-4 py-2 text-left">Amount</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patientClaims.map((claim) => (
                                            <tr key={claim.claimId} className="hover:bg-teal-50">
                                                <td className="px-4 py-2">{claim.claimId}</td>
                                                <td className="px-4 py-2">₹{claim.amount ? (typeof claim.amount === 'number' ? claim.amount.toLocaleString('en-IN') : claim.amount) : 'N/A'}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                                        claim.status === 'approved' ? 'bg-green-500 text-white' :
                                                        claim.status === 'pending' ? 'bg-yellow-500 text-white' :
                                                        'bg-red-500 text-white'
                                                    }`}>
                                                        {claim.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {claim.submissionDate 
                                                        ? new Date(claim.submissionDate).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {patientClaims.length === 0 && !loading && (
                        <div className="mt-6 text-center text-gray-500">
                            <p>No claims found for this patient</p>
                        </div>
                    )}
                </div>
            )}

            {!patientData && !loading && !error && (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-600">Enter a patient ID to search for patient information</p>
                </div>
            )}
        </div>
    );
};

export default PatientInformation;

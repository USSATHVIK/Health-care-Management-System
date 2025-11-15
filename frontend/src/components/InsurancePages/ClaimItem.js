import React from 'react';

const ClaimItem = ({ claim, onApprove, onReject, onViewDetails }) => {
  const claimId = claim.claimId || claim.id;
  const patientName = claim.patientName || claim.claimant || 'N/A';
  const amount = claim.amount || claim.claimAmount || 0;
  const diagnosis = claim.diagnosis || claim.description || 'N/A';
  const providerName = claim.doctorName || claim.providerName || 'N/A';
  const status = claim.status || 'pending';

  return (
    <div className="border p-4 rounded shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-xl">{patientName}</h3>
          <p className="text-sm text-gray-500">Claim ID: {claimId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          status === 'pending' || status === 'under review' ? 'bg-yellow-100 text-yellow-800' : 
          status === 'approved' ? 'bg-green-100 text-green-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Claim Amount:</p>
          <p className="font-semibold">₹{amount.toLocaleString('en-IN')}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Diagnosis:</p>
          <p className="font-semibold">{diagnosis}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Doctor/Provider:</p>
          <p className="font-semibold">{providerName}</p>
        </div>
        {claim.submissionDate && (
          <div>
            <p className="text-sm text-gray-600">Submission Date:</p>
            <p className="font-semibold">{new Date(claim.submissionDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition"
          onClick={() => onViewDetails(claim)}
        >
          View Details
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => onApprove(claimId)}
          disabled={status !== 'pending' && status !== 'under review'}
        >
          Approve
        </button>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          onClick={() => onReject(claimId)}
          disabled={status !== 'pending' && status !== 'under review'}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default ClaimItem;

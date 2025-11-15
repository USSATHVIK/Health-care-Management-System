import React from 'react';

const ClaimDetailsModal = ({ claim, onClose }) => {
  if (!claim) return null;

  const claimId = claim.claimId || claim.id;
  const patientName = claim.patientName || claim.claimant || 'N/A';
  const doctorName = claim.doctorName || claim.providerName || 'N/A';
  const amount = claim.amount || claim.claimAmount || 0;
  const diagnosis = claim.diagnosis || claim.description || 'N/A';
  const status = claim.status || 'pending';
  const submissionDate = claim.submissionDate || claim.createdAt;
  const transactionHash = claim.transactionHash || 'N/A';
  const reportCID = claim.reportCID || '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10" onClick={onClose}>
      <div className="bg-white p-6 rounded shadow-md w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Claim Details</h3>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Claim ID:</p>
              <p className="font-semibold">{claimId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status:</p>
              <p className={`font-semibold ${
                status === 'pending' || status === 'under review' ? 'text-yellow-600' : 
                status === 'approved' ? 'text-green-600' : 
                'text-red-600'
              }`}>{status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient Name:</p>
              <p className="font-semibold">{patientName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Doctor/Provider:</p>
              <p className="font-semibold">{doctorName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Claim Amount:</p>
              <p className="font-semibold">₹{amount.toLocaleString('en-IN')}</p>
            </div>
            {submissionDate && (
              <div>
                <p className="text-sm text-gray-600">Submission Date:</p>
                <p className="font-semibold">{new Date(submissionDate).toLocaleString()}</p>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Diagnosis/Description:</p>
            <p className="font-semibold">{diagnosis}</p>
          </div>

          {claim.procedureCodes && claim.procedureCodes.length > 0 && (
            <div>
              <p className="text-sm text-gray-600">Procedure Codes:</p>
              <p className="font-semibold">{claim.procedureCodes.join(', ')}</p>
            </div>
          )}

          {transactionHash && transactionHash !== 'N/A' && (
            <div>
              <p className="text-sm text-gray-600">Blockchain Transaction Hash:</p>
              <p className="font-semibold text-blue-600 break-all">{transactionHash}</p>
            </div>
          )}

          {reportCID && (
            <div>
              <p className="text-sm text-gray-600">Report (IPFS):</p>
              <a 
                href={`https://ipfs.io/ipfs/${reportCID}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                View Report on IPFS
              </a>
            </div>
          )}

          {claim.documents && claim.documents.length > 0 && (
            <div>
              <p className="text-sm text-gray-600">Documents:</p>
              <ul className="list-disc list-inside">
                {claim.documents.map((doc, index) => (
                  <li key={index}>
                    {doc.ipfsHash ? (
                      <a 
                        href={`https://ipfs.io/ipfs/${doc.ipfsHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Document {index + 1}
                      </a>
                    ) : (
                      <span>{doc.fileUrl || doc}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 text-right">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimDetailsModal;

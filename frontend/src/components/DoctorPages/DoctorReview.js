import React, { useState, useEffect } from 'react';
import { Button, Input, List, Typography, message, Card, Spin, Tag, Space, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, FileTextOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DoctorReview = () => {
  const [claims, setClaims] = useState([]);
  const [doctorReviews, setDoctorReviews] = useState({});
  const [manualFileUrls, setManualFileUrls] = useState({}); // Store manual URLs
  const [reviewingClaimId, setReviewingClaimId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState({}); // Track which claims are being reviewed

  // Fetch claims from the backend
  const fetchClaims = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Please login to review claims');
        return;
      }

      const response = await fetch('http://localhost:5001/api/claims/pending/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch claims');
      }

      const data = await response.json();

      if (data && Array.isArray(data.pendingClaims)) {
        setClaims(data.pendingClaims);
        if (data.pendingClaims.length === 0) {
          message.info('No pending claims to review');
        }
      } else if (data && data.message) {
        setClaims([]);
        message.info(data.message);
      } else {
        message.error('Unexpected data format');
        setClaims([]);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      message.error('Error fetching claims: ' + error.message);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleReviewInputChange = (claimId, value) => {
    setDoctorReviews((prev) => ({
      ...prev,
      [claimId]: value,
    }));
  };

  const handleManualFileUrlChange = (claimId, value) => {
    setManualFileUrls((prev) => ({
      ...prev,
      [claimId]: value,
    }));
  };

  const handleReview = async (claimId, status) => {
    const doctorReview = doctorReviews[claimId];

    // For rejection, ensure a reason is provided
    if (status === 'reject' && !doctorReview) {
      return message.error('Please enter a rejection reason');
    }

    try {
      setReviewing(prev => ({ ...prev, [claimId]: true }));
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Please login to review claims');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/claims/pending/review/${claimId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          doctorReview: status === 'reject' ? doctorReview : '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to review claim');
      }

      const result = await response.json();

      if (result.message) {
        message.success(result.message);
        setClaims(claims.filter((claim) => claim.claimId !== claimId)); // Remove reviewed claim from the list
        setReviewingClaimId(null); // Reset reviewing state after submission
        setDoctorReviews((prev) => {
          const newReviews = { ...prev };
          delete newReviews[claimId];
          return newReviews;
        });
        setManualFileUrls((prev) => {
          const newUrls = { ...prev };
          delete newUrls[claimId];
          return newUrls;
        });
      } else {
        message.error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error reviewing claim:', error);
      message.error('Error occurred while reviewing the claim: ' + error.message);
    } finally {
      setReviewing(prev => ({ ...prev, [claimId]: false }));
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === 'number') {
      return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (typeof amount === 'string' && amount.includes('ETH')) {
      return amount;
    }
    return amount || 'N/A';
  };

  if (loading && claims.length === 0) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading claims..." />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="text-teal-600">Review Claims</Title>
        <Button
          type="default"
          icon={<ReloadOutlined />}
          onClick={fetchClaims}
          loading={loading}
        >
          Refresh
        </Button>
      </div>

      {claims.length === 0 ? (
        <Card className="text-center py-12">
          <Text className="text-gray-500 text-lg">No pending claims to review</Text>
        </Card>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Card
              key={claim.claimId}
              className="mb-4 shadow-md hover:shadow-lg transition-shadow"
              title={
                <div className="flex justify-between items-center">
                  <Space>
                    <FileTextOutlined className="text-teal-600" />
                    <Text strong>Claim ID: {claim.claimId}</Text>
                    <Tag color="orange">{claim.status}</Tag>
                  </Space>
                </div>
              }
              extra={
                <Space>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleReview(claim.claimId, 'approve')}
                    loading={reviewing[claim.claimId]}
                    disabled={reviewing[claim.claimId]}
                  >
                    Approve
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => setReviewingClaimId(claim.claimId)}
                    loading={reviewing[claim.claimId]}
                    disabled={reviewing[claim.claimId]}
                  >
                    Reject
                  </Button>
                </Space>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text strong>Patient Name: </Text>
                  <Text className="text-teal-600">{claim.patientName || 'N/A'}</Text>
                </div>
                <div>
                  <Text strong>Doctor Name: </Text>
                  <Text>{claim.doctorName || 'N/A'}</Text>
                </div>
                <div>
                  <Text strong>Amount: </Text>
                  <Text className="text-green-600 font-semibold">{formatAmount(claim.amount)}</Text>
                </div>
                <div>
                  <Text strong>Submission Date: </Text>
                  <Text>{claim.submissionDate ? new Date(claim.submissionDate).toLocaleString() : 'N/A'}</Text>
                </div>
                {claim.transactionHash && (
                  <div className="md:col-span-2">
                    <Text strong>Transaction Hash: </Text>
                    <Text code className="break-all">{claim.transactionHash}</Text>
                  </div>
                )}
                {claim.description && (
                  <div className="md:col-span-2">
                    <Text strong>Description: </Text>
                    <Text>{claim.description}</Text>
                  </div>
                )}
              </div>

              <Divider />

              {/* Documents Section */}
              <div className="mt-4">
                <Title level={5}>Documents:</Title>
                {claim.documents && claim.documents.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {claim.documents.map((document, index) => (
                      <Card key={document._id || index} size="small" className="bg-gray-50">
                        <Space direction="vertical" size="small" className="w-full">
                          <div>
                            <Text strong>File Type: </Text>
                            <Text>{document.fileType || 'Unknown'}</Text>
                          </div>
                          {document.fileUrl && (
                            <Button
                              type="link"
                              href={document.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              icon={<FileTextOutlined />}
                            >
                              View Document
                            </Button>
                          )}
                          {document.ipfsHash && (
                            <div>
                              <Text strong>IPFS Hash: </Text>
                              <Text code className="text-xs break-all">{document.ipfsHash}</Text>
                            </div>
                          )}
                        </Space>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Text className="text-gray-500">No documents available</Text>
                )}
              </div>

              {/* Manual URL input for the doctor to check file manually */}
              <Divider />
              <div className="mt-4">
                <Text strong>Manual File URL: </Text>
                <Space className="mt-2 w-full" direction="vertical" style={{ width: '100%' }}>
                  <Input
                    placeholder="Enter file URL manually (optional)"
                    value={manualFileUrls[claim.claimId] || ''}
                    onChange={(e) => handleManualFileUrlChange(claim.claimId, e.target.value)}
                    allowClear
                  />
                  {manualFileUrls[claim.claimId] && (
                    <Button
                      type="link"
                      onClick={() => window.open(manualFileUrls[claim.claimId], '_blank')}
                      icon={<FileTextOutlined />}
                    >
                      Open URL
                    </Button>
                  )}
                </Space>
              </div>

              {/* Rejection Reason Input */}
              {reviewingClaimId === claim.claimId && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                  <Text strong className="text-red-600">Rejection Reason (Required):</Text>
                  <Input.TextArea
                    placeholder="Please enter a detailed reason for rejecting this claim..."
                    value={doctorReviews[claim.claimId] || ''}
                    onChange={(e) => handleReviewInputChange(claim.claimId, e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                  <Space className="mt-2">
                    <Button
                      type="primary"
                      danger
                      onClick={() => handleReview(claim.claimId, 'reject')}
                      loading={reviewing[claim.claimId]}
                      disabled={!doctorReviews[claim.claimId] || reviewing[claim.claimId]}
                    >
                      Submit Rejection
                    </Button>
                    <Button
                      onClick={() => {
                        setReviewingClaimId(null);
                        setDoctorReviews((prev) => {
                          const newReviews = { ...prev };
                          delete newReviews[claim.claimId];
                          return newReviews;
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorReview;

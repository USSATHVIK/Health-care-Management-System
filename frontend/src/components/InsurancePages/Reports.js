// import React, { useState } from 'react';
// import axios from 'axios';

// const Reports = () => {
//   const [reportType, setReportType] = useState('');
//   const [reportFormat, setReportFormat] = useState('');
//   const [email, setEmail] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState('');

//   // Handle report generation and download
//   const handleGenerateReport = async () => {
//     if (!reportType || !reportFormat) {
//       alert("Please select both report type and format");
//       return;
//     }

//     setLoading(true);
//     setMessage('');

//     try {
//       const response = await axios.post('http://localhost:5000/api/reports/generate', {
//         reportType,
//         format: reportFormat,
//       }, { responseType: 'blob' }); // Set responseType to 'blob' for file download

//       // Create a download link for the file
//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(response.data);
//       link.download = `${reportType}_report.${reportFormat.toLowerCase()}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       setMessage('Report generated successfully!');
//     } catch (error) {
//       console.error('Error generating report:', error);
//       setMessage('Failed to generate the report');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle email sending
//   const handleSendEmail = async () => {
//     if (!reportType || !reportFormat || !email) {
//       alert("Please select both report type, format, and provide an email address.");
//       return;
//     }

//     setLoading(true);
//     setMessage('');

//     try {
//       const response = await axios.post('http://localhost:5000/api/reports/send-email', {
//         reportType,
//         format: reportFormat,
//         email,
//       });

//       setMessage('Report sent successfully to email!');
//     } catch (error) {
//       console.error('Error sending email:', error);
//       setMessage('Failed to send the report via email');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-3xl font-bold text-teal-600">Reports & Downloads</h2>
//       <div className="my-4">
//         {/* Report Type Selection */}
//         <div>
//           <label className="block mb-2">Select Report Type:</label>
//           <select
//             className="w-full p-2 border border-gray-300"
//             value={reportType}
//             onChange={(e) => setReportType(e.target.value)}
//           >
//             <option value="">-- Select Report Type --</option>
//             <option value="claims-performance">Claims Performance</option>
//             <option value="approval-rates">Approval Rates</option>
//             <option value="payment-timelines">Payment Timelines</option>
//             <option value="fraud-detection">Fraud Detection</option>
//           </select>
//         </div>

//         {/* Report Format Selection */}
//         <div>
//           <label className="block mb-2 mt-4">Select Report Format:</label>
//           <select
//             className="w-full p-2 border border-gray-300"
//             value={reportFormat}
//             onChange={(e) => setReportFormat(e.target.value)}
//           >
//             <option value="">-- Select Report Format --</option>
//             <option value="CSV">CSV</option>
//             <option value="Excel">Excel</option>
//             <option value="PDF">PDF</option>
//           </select>
//         </div>

//         {/* Email Input Field */}
//         <div>
//           <label className="block mb-2 mt-4">Enter Email Address:</label>
//           <input
//             type="email"
//             className="w-full p-2 border border-gray-300"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             placeholder="example@example.com"
//           />
//         </div>

//         {/* Buttons for generating the report and sending email */}
//         <div className="mt-4">
//           <button
//             onClick={handleGenerateReport}
//             className="bg-teal-500 text-white p-2 rounded-md mr-4"
//             disabled={loading}
//           >
//             {loading ? 'Generating Report...' : 'Generate Report'}
//           </button>

//           <button
//             onClick={handleSendEmail}
//             className="bg-teal-500 text-white p-2 rounded-md"
//             disabled={loading}
//           >
//             {loading ? 'Sending Email...' : 'Send Report via Email'}
//           </button>
//         </div>

//         {/* Message or Feedback */}
//         {message && <p className="mt-4 text-green-600">{message}</p>}
//       </div>
//     </div>
//   );
// };

// export default Reports;


import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Get auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const Reports = () => {
  const [reportType, setReportType] = useState('');
  const [reportFormat, setReportFormat] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle report generation and download
  const handleGenerateReport = async () => {
    if (!reportType || !reportFormat) {
      setError('Please select both report type and format.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to generate reports.');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/reports/generate`,
        {
          reportType,
          format: reportFormat,
        },
        {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Create a download link for the file
      const link = document.createElement('a');
      link.href = URL.createObjectURL(response.data);
      link.download = `${reportType}_report.${reportFormat.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      setMessage('Report generated and downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to generate the report';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle email sending
  const handleSendEmail = async () => {
    if (!reportType || !reportFormat || !email) {
      setError('Please select both report type, format, and provide an email address.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to send reports.');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/reports/send-email`,
        {
          reportType,
          format: reportFormat,
          email,
        },
        {
          headers: getAuthHeaders()
        }
      );

      setMessage('Report sent successfully to email!');
    } catch (error) {
      console.error('Error sending email:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to send the report via email';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-teal-600 mb-6">Reports & Downloads</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        {/* Report Type Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Select Report Type:</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setError('');
              setMessage('');
            }}
          >
            <option value="">-- Select Report Type --</option>
            <option value="claims-performance">Claims Performance</option>
            <option value="approval-rates">Approval Rates</option>
            <option value="payment-timelines">Payment Timelines</option>
            <option value="fraud-detection">Fraud Detection</option>
          </select>
        </div>

        {/* Report Format Selection */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Select Report Format:</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            value={reportFormat}
            onChange={(e) => {
              setReportFormat(e.target.value);
              setError('');
              setMessage('');
            }}
          >
            <option value="">-- Select Report Format --</option>
            <option value="CSV">CSV</option>
            <option value="Excel">Excel</option>
            <option value="PDF">PDF</option>
          </select>
        </div>

        {/* Email Input Field */}
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Enter Email Address (for email delivery):</label>
          <input
            type="email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
              setMessage('');
            }}
            placeholder="example@example.com"
          />
        </div>

        {/* Buttons for generating the report and sending email */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleGenerateReport}
            className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading || !reportType || !reportFormat}
          >
            {loading ? 'Generating Report...' : '📥 Download Report'}
          </button>

          <button
            onClick={handleSendEmail}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={loading || !reportType || !reportFormat || !email}
          >
            {loading ? 'Sending Email...' : '📧 Send via Email'}
          </button>
        </div>

        {/* Feedback Messages */}
        {message && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <p className="font-semibold">✓ {message}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-semibold">✗ {error}</p>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Report Types:</h3>
        <ul className="list-disc list-inside text-blue-700 space-y-1">
          <li><strong>Claims Performance:</strong> Detailed view of all claims with status and dates</li>
          <li><strong>Approval Rates:</strong> Statistics on claim approval, rejection, and pending rates</li>
          <li><strong>Payment Timelines:</strong> Approved claims with processing time and payment status</li>
          <li><strong>Fraud Detection:</strong> Claims with rejection reasons and dispute information</li>
        </ul>
      </div>
    </div>
  );
};

export default Reports;

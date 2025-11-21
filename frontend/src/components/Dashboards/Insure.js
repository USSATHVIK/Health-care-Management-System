

// import React, { useEffect, useRef, useState } from 'react';
// import { motion } from 'framer-motion';
// import { Link, useNavigate } from 'react-router-dom';
// import Chart from 'chart.js/auto'; // Import Chart.js (or any other charting library)

// const InsuranceDashboard = () => {
//   const navigate = useNavigate();
  
//   // Handle logout functionality
//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('role');
//     navigate('/login');
//   };

//   // Dummy data for charts
//   const [chartData, setChartData] = useState({
//     labels: ['Pending', 'Approved', 'Rejected'],
//     datasets: [{
//       label: 'Claims Status',
//       data: [12, 19, 3], // Example data
//       backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
//       borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
//       borderWidth: 1,
//     }]
//   });

//   const chartRef = useRef(null); // Ref to store the canvas element
//   const chartInstanceRef = useRef(null); // Ref to store the Chart.js instance

//   useEffect(() => {
//     // Create the chart only when the canvas is available
//     if (chartRef.current) {
//       // Destroy previous chart if it exists
//       if (chartInstanceRef.current) {
//         chartInstanceRef.current.destroy();
//       }

//       // Create new chart
//       const ctx = chartRef.current.getContext('2d');
//       chartInstanceRef.current = new Chart(ctx, {
//         type: 'pie',
//         data: chartData,
//       });
//     }

//     // Cleanup: Destroy chart when component is unmounted or chart data changes
//     return () => {
//       if (chartInstanceRef.current) {
//         chartInstanceRef.current.destroy();
//       }
//     };
//   }, [chartData]); // Recreate chart whenever chartData changes

//   return (
//     <div className="flex min-h-screen bg-gradient-to-r from-teal-400 to-blue-500">
//       {/* Main container with Sidebar and Content */}
//       <div className="flex flex-1">
        
//         {/* Sidebar */}
//         <motion.div
//           className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between relative"
//           initial={{ opacity: 0, x: -250 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5 }}
//           whileHover={{ x: 0 }}
//           whileTap={{ scale: 0.95 }}
//         >
//           <h2 className="text-3xl font-bold text-teal-600 mb-6">Insurer Dashboard</h2> 
//           <ul>
//             <li>
//               <Link to="/dashboard" className="text-teal-600 hover:bg-teal-100 p-2 rounded-lg">Dashboard Overview</Link>
//             </li>
//             <li>
//               <Link to="/claims" className="text-teal-600 hover:bg-teal-100 p-2 rounded-lg">Claims Management</Link>
//             </li>
//             <li>
//               <Link to="/pending-claims" className="text-teal-600 hover:bg-teal-100 p-2 rounded-lg">Pending Claims</Link>
//             </li>
//             <li>
//               <Link to="/approved-claims" className="text-teal-600 hover:bg-teal-100 p-2 rounded-lg">Approved Claims</Link>
//             </li>
//             <li>
//               <Link to="/rejected-claims" className="text-teal-600 hover:bg-teal-100 p-2 rounded-lg">Rejected Claims</Link>
//             </li>
//             <li>
//               <Link to="/claims-history" className="text-teal-600 hover:bg-teal-100 p-2 rounded-lg">Claim History</Link>
//             </li>
//             <li>
//               <Link to="/reports" className="text-teal-600 hover:bg-teal-100 p-2 rounded-lg">Reports & Downloads</Link>
//             </li>
//             <li>
//               <Link to="/user-management" className="text-teal-600 hover:bg-teal-100 p-2 rounded-lg">User Management</Link>
//             </li>
//             <li>
//               <Link to="/compliance" className="text-teal-600 hover:bg-teal-100 p-2 rounded-lg">Compliance</Link>
//             </li>
//           </ul>
//         </motion.div>

//         {/* Main Content Area */}
//         <div className="flex-1 p-8">
//           {/* Top Navbar */}
//           <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg mb-6">
//             {/* Profile Section - Aligned to the left */}
//             <div className="flex items-center space-x-4">
//               <img
//                 src="https://via.placeholder.com/40"
//                 alt="Profile"
//                 className="rounded-full w-10 h-10"
//               />
//               <span className="text-lg font-semibold text-teal-600">John Doe</span>
//             </div>

//             {/* Logout Button - Aligned to the right */}
//             <button
//               className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
//               onClick={handleLogout}
//             >
//               Logout
//             </button>
//           </div>

//           {/* Main Dashboard Content */}
//           <motion.div
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 1 }}
//           >
//             {/* Claims Overview Card */}
//             <motion.div
//               className="bg-white rounded-xl shadow-lg p-6"
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               transition={{ type: 'spring', stiffness: 100 }}
//             >
//               <h3 className="text-2xl font-bold text-teal-600 mb-4">Claims Overview</h3>
//               <canvas ref={chartRef} width="200" height="200"></canvas>
//             </motion.div>

//             {/* Claims Management Card */}
//             <motion.div
//               className="bg-white rounded-xl shadow-lg p-6"
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               transition={{ type: 'spring', stiffness: 100 }}
//             >
//               <h3 className="text-2xl font-bold text-teal-600 mb-4">Claims Management</h3>
//               <p className="text-gray-600">Manage and approve/reject claims here.</p>
//               <Link to="/claims" className="mt-4 text-teal-600 hover:text-teal-700 transition">
//                 Go to Claims Management
//               </Link>
//             </motion.div>

//             {/* Reports Card */}
//             <motion.div
//               className="bg-white rounded-xl shadow-lg p-6"
//               initial={{ scale: 0.8 }}
//               animate={{ scale: 1 }}
//               transition={{ type: 'spring', stiffness: 100 }}
//             >
//               <h3 className="text-2xl font-bold text-teal-600 mb-4">Reports & Downloads</h3>
//               <p className="text-gray-600">View and download detailed reports.</p>
//               <Link to="/reports" className="mt-4 text-teal-600 hover:text-teal-700 transition">
//                 Go to Reports
//               </Link>
//             </motion.div>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InsuranceDashboard;


import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto'; // Import Chart.js (or any other charting library)
import axios from 'axios';

const InsuranceDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);

  // Handle logout functionality
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Fetch user data and statistics
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }

        // Fetch statistics
        const headers = {
          'Authorization': `Bearer ${token}`
        };

        const [pendingRes, approvedRes, rejectedRes] = await Promise.allSettled([
          axios.get('http://localhost:5001/api/claims/pending/pending?stage=insurer', { headers }),
          axios.get('http://localhost:5001/api/claims/approved', { headers }),
          axios.get('http://localhost:5001/api/claims/rejected', { headers })
        ]);

        // Handle pending claims response
        let pendingCount = 0;
        if (pendingRes.status === 'fulfilled') {
          console.log('Pending claims response:', pendingRes.value.data);
          if (pendingRes.value.data?.pendingClaims && Array.isArray(pendingRes.value.data.pendingClaims)) {
            pendingCount = pendingRes.value.data.pendingClaims.length;
          } else if (Array.isArray(pendingRes.value.data)) {
            pendingCount = pendingRes.value.data.length;
          }
        } else {
          console.error('Pending claims error:', pendingRes.reason?.response?.data || pendingRes.reason);
        }

        // Handle approved claims response
        let approvedCount = 0;
        if (approvedRes.status === 'fulfilled') {
          console.log('Approved claims response:', approvedRes.value.data);
          if (Array.isArray(approvedRes.value.data)) {
            approvedCount = approvedRes.value.data.length;
          }
        } else {
          console.error('Approved claims error:', approvedRes.reason?.response?.data || approvedRes.reason);
        }

        // Handle rejected claims response
        let rejectedCount = 0;
        if (rejectedRes.status === 'fulfilled') {
          console.log('Rejected claims response:', rejectedRes.value.data);
          if (Array.isArray(rejectedRes.value.data)) {
            rejectedCount = rejectedRes.value.data.length;
          }
        } else {
          console.error('Rejected claims error:', rejectedRes.reason?.response?.data || rejectedRes.reason);
        }

        setStats({
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          total: pendingCount + approvedCount + rejectedCount
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set stats to 0 on error to show empty state
        setStats({
          pending: 0,
          approved: 0,
          rejected: 0,
          total: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Chart data based on real statistics
  const [chartData, setChartData] = useState({
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [{
      label: 'Claims Status',
      data: [stats.pending, stats.approved, stats.rejected],
      backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
      borderWidth: 1,
    }]
  });

  // Update chart data when stats change
  useEffect(() => {
    setChartData({
      labels: ['Pending', 'Approved', 'Rejected'],
      datasets: [{
        label: 'Claims Status',
        data: [stats.pending, stats.approved, stats.rejected],
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      }]
    });
  }, [stats]);

  const chartRef = useRef(null); // Ref to store the canvas element
  const chartInstanceRef = useRef(null); // Ref to store the Chart.js instance

  useEffect(() => {
    // Create the chart only when the canvas is available
    if (chartRef.current) {
      // Destroy previous chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create new chart
      const ctx = chartRef.current.getContext('2d');
      chartInstanceRef.current = new Chart(ctx, {
        type: 'pie',
        data: chartData,
      });
    }

    // Cleanup: Destroy chart when component is unmounted or chart data changes
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [chartData]); // Recreate chart whenever chartData changes

  // Handle back navigation
  const handleBack = () => {
    navigate(-1); // This will navigate to the previous page
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-teal-400 to-blue-500">
      {/* Main container with Sidebar and Content */}
      <div className="flex flex-1">

        {/* Sidebar */}
        <motion.div
          className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between relative transform transition-all duration-300"
          initial={{ opacity: 0, x: -250 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Section - Aligned to the left */}
          <div className="flex items-center space-x-4 mb-6">
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="rounded-full w-10 h-10"
            />
            <span className="text-lg font-semibold text-teal-600">
              {user?.name || user?.email || 'Insurer'}
            </span>
          </div>

          <ul className="space-y-4">
            {/* Dashboard Overview */}
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
              <Link to="/dashboard" className="text-teal-600">Dashboard Overview</Link>
            </li>

            {/* Claims Management */}
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
              <Link to="/claims" className="text-teal-600">Claims Management</Link>
            </li>

            {/* Pending Claims */}
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
              <Link to="/pending-claims" className="text-teal-600">Pending Claims</Link>
            </li>

            {/* Approved Claims */}
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
              <Link to="/approved-claims" className="text-teal-600">Approved Claims</Link>
            </li>

            {/* Rejected Claims */}
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
              <Link to="/rejected-claims" className="text-teal-600">Rejected Claims</Link>
            </li>

            {/* Claim History */}
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
              <Link to="/claims-history" className="text-teal-600">Claim History</Link>
            </li>

            {/* Reports & Downloads */}
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
              <Link to="/reports" className="text-teal-600">Reports & Downloads</Link>
            </li>

            {/* User Management */}
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
              <Link to="/user-management" className="text-teal-600">User Management</Link>
            </li>

            {/* Compliance */}
            <li className="hover:shadow-lg hover:bg-teal-100 p-4 rounded-lg">
              <Link to="/compliance" className="text-teal-600">Compliance</Link>
            </li>
          </ul>

          {/* Logout Button */}
          <button
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition mt-4"
            onClick={handleLogout}
          >
            Logout
          </button>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {/* Back Button */}
          <div className="mb-4">
            <button
              className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition"
              onClick={handleBack}
            >
              Back
            </button>
          </div>

          {/* Top Navbar */}
          <div className="flex items-center justify-between bg-white p-4 shadow-md rounded-lg mb-6">
            {/* Profile Section - Aligned to the left */}
            <div className="flex items-center space-x-4">
              <img
                src="https://via.placeholder.com/40"
                alt="Profile"
                className="rounded-full w-10 h-10"
              />
              <span className="text-lg font-semibold text-teal-600">
                {user?.name || user?.email || 'Insurer'}
              </span>
            </div>

            {/* Logout Button - Aligned to the right */}
            <button
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {/* Main Dashboard Content */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Claims Overview Card */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <h3 className="text-2xl font-bold text-teal-600 mb-4">Claims Overview</h3>
              {loading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
              ) : (
                <>
                  <canvas ref={chartRef} width="200" height="200"></canvas>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm"><strong>Total Claims:</strong> {stats.total}</p>
                    <p className="text-sm text-yellow-600"><strong>Pending:</strong> {stats.pending}</p>
                    <p className="text-sm text-green-600"><strong>Approved:</strong> {stats.approved}</p>
                    <p className="text-sm text-red-600"><strong>Rejected:</strong> {stats.rejected}</p>
                  </div>
                </>
              )}
            </motion.div>

            {/* Claims Management Card */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <h3 className="text-2xl font-bold text-teal-600 mb-4">Claims Management</h3>
              <p className="text-gray-600">Manage and approve/reject claims here.</p>
              <Link to="/claims" className="mt-4 text-teal-600 hover:text-teal-700 transition">
                Go to Claims Management
              </Link>
            </motion.div>

            {/* Reports Card */}
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
            >
              <h3 className="text-2xl font-bold text-teal-600 mb-4">Reports & Downloads</h3>
              <p className="text-gray-600">View and download detailed reports.</p>
              <Link to="/reports" className="mt-4 text-teal-600 hover:text-teal-700 transition">
                Go to Reports
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceDashboard;
  
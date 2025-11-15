
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// AUTHENTICATION - DASHBOARD 
import Login from './components/Pages/Login';
import Register from './components/Pages/Register';
import ProtectedRoute from './components/Pages/ProtectedRoute';

import NotFound from './components/Pages/NotFound';
import ForgotPassword from './components/Pages/ForgotPassword.js';
import ResetPassword from './components/Pages/ResetPassword.js';


// HOME SCREEN AND MAIN DASHBOARD

import HomeScreen from './components/Dashboard';
import AdminDashboard from './components/Dashboards/AdminDashboard';
import UserDashboard from './components/Dashboards/UserDashboard';
import About from './components/Pages/About.js';
import ContactUs from './components/Pages/ContactUs.js';




// IMPORTING INSURANCE DASHBOARD COMPONENTS
import InsuranceDashboard from './components/Dashboards/Insure.js';
import Policies from './components/InsurancePages/Policies.js';
import HealthInsurance from './components/Pages/HealthInsurance.js';
import ClaimStatus from './components/InsurancePages/ClaimStatus.js';
import DashboardOverview from './components/InsurancePages/DashboardOverview.js';
import ClaimsManagement from './components/InsurancePages/ClaimsManagement.js';
import PendingClaims from './components/InsurancePages/PendingClaims.js';
import ApprovedClaims from './components/InsurancePages/ApprovedClaims.js';
import RejectedClaims from './components/InsurancePages/RejectedClaims.js';
import ClaimsHistory from './components/InsurancePages/ClaimsHistory.js';
import Reports from './components/InsurancePages/Reports.js';
import UserManagement from './components/InsurancePages/UserManagement.js';
import Compliance from './components/InsurancePages/Compliance.js';






// DOCTOR DASHBOARD COMPONENTS
import ManagePolicies from './components/DoctorPages/ManagePolicies';
import ManageUsers from './components/DoctorPages/ManageUsers';
import ManageClaims from './components/DoctorPages/ManageClaims';
import EditUser from './components/DoctorPages/EditUser';
import ViewClaims from './components/DoctorPages/ViewClaims';
import ViewReports from './components/DoctorPages/ViewReports';
import ViewCompliance from './components/DoctorPages/ViewCompliance';
import SystemSettings from './components/DoctorPages/SystemSettings';
 
import ClaimStatusTracker from './components/DoctorPages/ClaimStatusTracker';
import SmartContractInteraction from './components/DoctorPages/SmartContractInteraction';
import ActivityLog from './components/DoctorPages/ActivityLog.js';
import SecureCommunication from './components/DoctorPages/SecureCommunication';
import DoctorReview from './components/DoctorPages/DoctorReview.js';
import PatientInformation from './components/DoctorPages/PatientInformation';



// USER DASHBOARD COMPONENTS
import ClaimSubmission from './components/Dashboards/PatientDashboard/ClaimSubmission';
// import ClaimReview from './components/Dashboards/PatientDashboard/ClaimReview';
import Settings from './components/Dashboards/PatientDashboard/Settings.js';
import TrackClaims from './components/Dashboards/PatientDashboard/TrackClaims.js';
import PatientReports from './components/Dashboards/PatientDashboard/PatientReports.js';
import PatientDashboardOverview from './components/Dashboards/PatientDashboard/PatientDashboardOverview.js';



function App() {
    // Authentication is now handled by ProtectedRoute component
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomeScreen />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/insurance" element={<HealthInsurance />} />
                <Route path="/claims" element={<ClaimStatus />} />  {/* New claims route */}
                <Route path="/policies" element={<Policies />} />
                <Route path="/dashboard" element={<InsuranceDashboard />} />
                <Route path="/dashboard-overview" element={<DashboardOverview />} />
                <Route path="/claims" element={<ClaimsManagement />} />
                <Route path="/pending-claims" element={<PendingClaims />} />
                <Route path="/approved-claims" element={<ApprovedClaims />} />
                <Route path="/rejected-claims" element={<RejectedClaims />} />
                <Route path="/claims-history" element={<ClaimsHistory />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/compliance" element={<Compliance />} />




                      {/*TODO: Admin Dashboard */}

                      <Route path="/dashboard/doctor" element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/manage-policies" element={<ProtectedRoute element={<ManagePolicies />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/manage-users" element={<ProtectedRoute element={<ManageUsers />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/manage-claims" element={<ProtectedRoute element={<ManageClaims />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/edit-user/:userId" element={<ProtectedRoute element={<EditUser />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/view-claims" element={<ProtectedRoute element={<ViewClaims />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/view-reports" element={<ProtectedRoute element={<ViewReports />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/view-compliance" element={<ProtectedRoute element={<ViewCompliance />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/system-settings" element={<ProtectedRoute element={<SystemSettings />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/claim-submission" element={<ProtectedRoute element={<DoctorReview />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/track-claim-status" element={<ProtectedRoute element={<ClaimStatusTracker />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/smart-contract-interaction" element={<ProtectedRoute element={<SmartContractInteraction />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/activity-log" element={<ProtectedRoute element={<ActivityLog />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/secure-communication" element={<ProtectedRoute element={<SecureCommunication />} requiredRole="admin" />} />
                <Route path="/dashboard/doctor/patient-information" element={<ProtectedRoute element={<PatientInformation />} requiredRole="admin" />} />


        {/* TODO:USER DASHBOARD */}
       {/* User Dashboard with nested routes */}
       <Route path="/dashboard/patient" element={<UserDashboard />}>
                <Route path="dashboard-overview" element={<PatientDashboardOverview/>} />
                <Route path="claim-submission" element={<ClaimSubmission />} />
                <Route path="track-claims" element={<TrackClaims />} />
                <Route path="view-reports" element={<PatientReports />} />
                <Route path="settings" element={<Settings />} />
            </Route>

                {/* Protected Routes */}    
                <Route 
                    path="/dashboard/user" 
                    element={<ProtectedRoute element={<UserDashboard />} />} 
                />
                <Route 
                    path="/dashboard/admin" 
                    element={<ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />} 
                />
                  <Route 
                    path="/dashboard/insurer" 
                    element={<ProtectedRoute element={<InsuranceDashboard />} requiredRole="insurer" />} 
                />
                <Route path="*" element={<NotFound />} /> {/* Fallback route */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
            </Routes>
        </Router>
    );
}

export default App;




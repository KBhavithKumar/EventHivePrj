// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { adminAPI, apiUtils } from '../../services/api';
// import toast from 'react-hot-toast';
// import AdminLayout from '../../components/layout/AdminLayout';

// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const [stats, setStats] = useState(null);
//   const [pendingApprovals, setPendingApprovals] = useState([]);
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true);
      
//       const [
//         statsResponse,
//         organizationsResponse,
//         eventsResponse
//       ] = await Promise.all([
//         adminAPI.getDashboardStats(),
//         adminAPI.getOrganizations({ status: 'PENDING_APPROVAL', limit: 5 }),
//         adminAPI.getEvents({ status: 'PENDING_APPROVAL', limit: 5 })
//       ]);

//       setStats(statsResponse.data.data.stats);
      
//       // Combine pending organizations and events
//       const pendingOrgs = organizationsResponse.data.data.organizations.map(org => ({
//         ...org,
//         type: 'organization'
//       }));
//       const pendingEvents = eventsResponse.data.data.events.map(event => ({
//         ...event,
//         type: 'event'
//       }));
      
//       setPendingApprovals([...pendingOrgs, ...pendingEvents]);
//     } catch (error) {
//       const errorData = apiUtils.handleError(error);
//       toast.error(errorData.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleApproval = async (id, type, action) => {
//     try {
//       if (type === 'organization') {
//         await adminAPI.updateOrganizationApproval(id, { 
//           status: action === 'approve' ? 'APPROVED' : 'REJECTED',
//           adminNotes: action === 'approve' ? 'Approved by admin' : 'Rejected by admin'
//         });
//       } else if (type === 'event') {
//         await adminAPI.updateEventApproval(id, { 
//           status: action === 'approve' ? 'APPROVED' : 'REJECTED',
//           adminNotes: action === 'approve' ? 'Approved by admin' : 'Rejected by admin'
//         });
//       }
      
//       toast.success(`${type} ${action}d successfully!`);
//       fetchDashboardData(); // Refresh data
//     } catch (error) {
//       const errorData = apiUtils.handleError(error);
//       toast.error(errorData.message);
//     }
//   };

//   if (isLoading) {
//     return (
//       <AdminLayout>
//         <div className="flex items-center justify-center h-96">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <AdminLayout>
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900">
//           Admin Dashboard
//         </h1>
//             <p className="text-gray-600 mt-2">
//               Welcome back, {user?.firstName} {user?.lastName}
//             </p>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Total Users</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Organizations</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats?.totalOrganizations || 0}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-yellow-100 rounded-lg">
//                   <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Total Events</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats?.totalEvents || 0}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-red-100 rounded-lg">
//                   <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats?.pendingApprovals || 0}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Pending Approvals */}
//             <div className="bg-white rounded-lg shadow">
//               <div className="p-6 border-b border-gray-200">
//                 <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
//               </div>
//               <div className="p-6">
//                 {pendingApprovals.length > 0 ? (
//                   <div className="space-y-4">
//                     {pendingApprovals.map((item) => (
//                       <div key={`${item.type}-${item._id}`} className="border border-gray-200 rounded-lg p-4">
//                         <div className="flex justify-between items-start">
//                           <div className="flex-1">
//                             <div className="flex items-center">
//                               <h3 className="font-medium text-gray-900">
//                                 {item.type === 'organization' ? item.name : item.title}
//                               </h3>
//                               <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                                 {item.type}
//                               </span>
//                             </div>
//                             <p className="text-sm text-gray-600 mt-1">
//                               {item.type === 'organization' ? item.description : item.description}
//                             </p>
//                             <p className="text-xs text-gray-500 mt-2">
//                               Submitted: {new Date(item.createdAt).toLocaleDateString()}
//                             </p>
//                           </div>
//                           <div className="flex space-x-2 ml-4">
//                             <button
//                               onClick={() => handleApproval(item._id, item.type, 'approve')}
//                               className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
//                             >
//                               Approve
//                             </button>
//                             <button
//                               onClick={() => handleApproval(item._id, item.type, 'reject')}
//                               className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
//                             >
//                               Reject
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 text-center py-8">No pending approvals</p>
//                 )}
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-white rounded-lg shadow">
//               <div className="p-6 border-b border-gray-200">
//                 <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
//               </div>
//               <div className="p-6">
//                 <div className="grid grid-cols-2 gap-4">
//                   <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <div className="text-center">
//                       <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                       </svg>
//                       <p className="text-sm font-medium text-gray-900">Manage Users</p>
//                     </div>
//                   </button>

//                   <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <div className="text-center">
//                       <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                       </svg>
//                       <p className="text-sm font-medium text-gray-900">Organizations</p>
//                     </div>
//                   </button>

//                   <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <div className="text-center">
//                       <svg className="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                       </svg>
//                       <p className="text-sm font-medium text-gray-900">Events</p>
//                     </div>
//                   </button>

//                   <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
//                     <div className="text-center">
//                       <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                       </svg>
//                       <p className="text-sm font-medium text-gray-900">Analytics</p>
//                     </div>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Recent Activity */}
//           <div className="mt-8 bg-white rounded-lg shadow">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
//             </div>
//             <div className="p-6">
//               <div className="space-y-4">
//                 {/* Mock recent activity data */}
//                 <div className="flex items-center space-x-3">
//                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                   <p className="text-sm text-gray-600">
//                     <span className="font-medium">Tech Club</span> organization was approved
//                   </p>
//                   <span className="text-xs text-gray-500">2 hours ago</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
//                   <p className="text-sm text-gray-600">
//                     New event <span className="font-medium">"AI Workshop"</span> submitted for approval
//                   </p>
//                   <span className="text-xs text-gray-500">4 hours ago</span>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
//                   <p className="text-sm text-gray-600">
//                     <span className="font-medium">25 new users</span> registered today
//                   </p>
//                   <span className="text-xs text-gray-500">6 hours ago</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//     </AdminLayout>
//   );
// };

// export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI, apiUtils } from '../../services/api';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      const [
        statsResponse,
        organizationsResponse,
        eventsResponse
      ] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getOrganizations({ status: 'PENDING_APPROVAL', limit: 5 }),
        adminAPI.getEvents({ status: 'PENDING_APPROVAL', limit: 5 })
      ]);

      setStats(statsResponse.data.data.stats);

      const pendingOrgs = organizationsResponse.data.data.organizations.map(org => ({
        ...org,
        type: 'organization'
      }));
      const pendingEvents = eventsResponse.data.data.events.map(event => ({
        ...event,
        type: 'event'
      }));

      setPendingApprovals([...pendingOrgs, ...pendingEvents]);
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      toast.error(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (id, type, action) => {
    try {
      if (type === 'organization') {
        await adminAPI.updateOrganizationApproval(id, {
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          adminNotes: action === 'approve' ? 'Approved by admin' : 'Rejected by admin'
        });
      } else if (type === 'event') {
        await adminAPI.updateEventApproval(id, {
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          adminNotes: action === 'approve' ? 'Approved by admin' : 'Rejected by admin'
        });
      }

      toast.success(`${type} ${action}d successfully!`);
      fetchDashboardData();
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      toast.error(errorData.message);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.firstName} {user?.lastName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        {/* Organizations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Organizations</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalOrganizations || 0}</p>
            </div>
          </div>
        </div>

        {/* Events */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalEvents || 0}</p>
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingApprovals || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Pending Approvals</h2>
          </div>
          <div className="p-6">
            {pendingApprovals.length > 0 ? (
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div key={`${item.type}-${item._id}`} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900">
                            {item.type === 'organization' ? item.name : item.title}
                          </h3>
                          <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {item.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Submitted: {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleApproval(item._id, item.type, 'approve')}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(item._id, item.type, 'reject')}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No pending approvals</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <svg className="w-8 h-8 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">Manage Users</p>
                </div>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <svg className="w-8 h-8 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">Organizations</p>
                </div>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <svg className="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">Events</p>
                </div>
              </button>

              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-center">
                  <svg className="w-8 h-8 text-purple-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">Analytics</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tech Club</span> organization was approved
              </p>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-600">
                New event <span className="font-medium">"AI Workshop"</span> submitted for approval
              </p>
              <span className="text-xs text-gray-500">4 hours ago</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">25 new users</span> registered today
              </p>
              <span className="text-xs text-gray-500">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

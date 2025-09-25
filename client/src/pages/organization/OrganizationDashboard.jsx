// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { organizationAPI, apiUtils } from '../../services/api';
// import toast from 'react-hot-toast';
// import OrganizationLayout from '../../components/layout/OrganizationLayout';

// const OrganizationDashboard = () => {
//   const { user, logout } = useAuth();
//   const [stats, setStats] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showCreateEvent, setShowCreateEvent] = useState(false);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setIsLoading(true);
      
//       const [statsResponse, eventsResponse] = await Promise.all([
//         organizationAPI.getDashboardStats(),
//         organizationAPI.getEvents({ limit: 10 })
//       ]);

//       setStats(statsResponse.data.data.stats);
//       setEvents(eventsResponse.data.data.events);
//     } catch (error) {
//       const errorData = apiUtils.handleError(error);
//       toast.error(errorData.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <OrganizationLayout>
//         <div className="flex items-center justify-center h-96">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
//         </div>
//       </OrganizationLayout>
//     );
//   }

//   return (
//     <OrganizationLayout>
//       {/* Header */}
//       <div className="mb-8 flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             {user?.name} Dashboard
//           </h1>
//               <p className="text-gray-600 mt-2">
//                 Manage your events and participants
//               </p>
//             </div>
//             <button
//               onClick={() => setShowCreateEvent(true)}
//               className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Create Event
//             </button>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Total Participants</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats?.totalParticipants || 0}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-yellow-100 rounded-lg">
//                   <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Active Events</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats?.activeEvents || 0}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-purple-100 rounded-lg">
//                   <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                   </svg>
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Avg. Attendance</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats?.avgAttendance || 0}%</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Events List */}
//           <div className="bg-white rounded-lg shadow">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className="text-xl font-semibold text-gray-900">Your Events</h2>
//             </div>
//             <div className="p-6">
//               {events.length > 0 ? (
//                 <div className="space-y-4">
//                   {events.map((event) => (
//                     <div key={event._id} className="border border-gray-200 rounded-lg p-6">
//                       <div className="flex justify-between items-start">
//                         <div className="flex-1">
//                           <div className="flex items-center">
//                             <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
//                             <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
//                               event.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
//                               event.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
//                               event.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
//                               'bg-red-100 text-red-800'
//                             }`}>
//                               {event.status}
//                             </span>
//                           </div>
//                           <p className="text-gray-600 mt-2">{event.description}</p>
//                           <div className="flex items-center mt-4 space-x-6 text-sm text-gray-500">
//                             <div className="flex items-center">
//                               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                               </svg>
//                               {new Date(event.startDateTime).toLocaleDateString()}
//                             </div>
//                             <div className="flex items-center">
//                               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                               </svg>
//                               {event.participantCount || 0} participants
//                             </div>
//                             <div className="flex items-center">
//                               <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                               </svg>
//                               {event.category}
//                             </div>
//                           </div>
//                         </div>
//                         <div className="flex space-x-2 ml-4">
//                           <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
//                             View Details
//                           </button>
//                           <button className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors">
//                             Edit
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                   </svg>
//                   <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
//                   <p className="text-gray-500 mb-4">Get started by creating your first event</p>
//                   <button
//                     onClick={() => setShowCreateEvent(true)}
//                     className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                   >
//                     Create Event
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Create Event Modal */}
//       {showCreateEvent && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-semibold text-gray-900">Create New Event</h2>
//                 <button
//                   onClick={() => setShowCreateEvent(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <p className="text-gray-600 text-center">
//                 Event creation form will be implemented here
//               </p>
//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowCreateEvent(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                   Create Event
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </OrganizationLayout>
//   );
// };

// export default OrganizationDashboard;
import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";

import OrganizationLayout from "../../components/layout/OrganizationLayout";
import { organizationAPI } from "../../services/api";
// import { apiUtils } from "../../utils/apiUtils";
import { useAuth } from "../../context/AuthContext";

const OrganizationDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    category: "",
    venue: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsResponse, eventsResponse] = await Promise.all([
        organizationAPI.getDashboardStats(),
        organizationAPI.getEvents({ limit: 10 }),
      ]);

      setStats(statsResponse.data.data.stats);
      setEvents(eventsResponse.data.data.events);
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      toast.error(errorData.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error("Title and Date are required!");
      return;
    }

    try {
      await organizationAPI.createEvent(newEvent);
      toast.success("Event created successfully!");
      setShowCreateEvent(false);
      fetchDashboardData();
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      toast.error(errorData.message);
    }
  };

  if (isLoading) {
    return (
      <OrganizationLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </OrganizationLayout>
    );
  }

  return (
    <OrganizationLayout>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.name} Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your events and participants
          </p>
        </div>
        <button
          onClick={() => setShowCreateEvent(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Total Events</h3>
          <p className="mt-2 text-2xl font-bold text-blue-600">
            {stats?.totalEvents || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">Upcoming</h3>
          <p className="mt-2 text-2xl font-bold text-green-600">
            {stats?.upcomingEvents || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800">
            Participants
          </h3>
          <p className="mt-2 text-2xl font-bold text-purple-600">
            {stats?.totalParticipants || 0}
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Events
        </h2>
        {events.length === 0 ? (
          <p className="text-gray-600">No events found</p>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                key={event._id}
                className="border p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {event.title}
                  </h3>
                  <p className="text-gray-600">{event.date}</p>
                </div>
                <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                  {event.category}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Event
              </h2>
              <button
                onClick={() => setShowCreateEvent(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Event Title"
                value={newEvent.title}
                onChange={handleEventChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <textarea
                name="description"
                placeholder="Event Description"
                value={newEvent.description}
                onChange={handleEventChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="date"
                name="date"
                value={newEvent.date}
                onChange={handleEventChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={newEvent.category}
                onChange={handleEventChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                name="venue"
                placeholder="Venue"
                value={newEvent.venue}
                onChange={handleEventChange}
                className="w-full px-4 py-2 border rounded-lg"
              />

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </OrganizationLayout>
  );
};

export default OrganizationDashboard;

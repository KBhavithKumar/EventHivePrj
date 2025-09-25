import React from 'react';
import { Calendar, MapPin, Users, ExternalLink, Clock } from 'lucide-react';

const EventsSection = ({ featuredEvents = [], upcomingEvents = [], isLoading = false }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const startDate = new Date(event.startDateTime);
    const registrationDeadline = new Date(event.registrationDeadline);

    if (now > startDate) return 'Completed';
    if (now > registrationDeadline) return 'Registration Closed';
    if (event.currentParticipants >= event.maxParticipants) return 'Full';
    return 'Registration Open';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Registration Open': return 'bg-green-100 text-green-800';
      case 'Registration Closed': return 'bg-red-100 text-red-800';
      case 'Full': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      case 'Event Live': return 'bg-blue-100 text-blue-800';
      case 'Event Ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading events...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const allEvents = [...featuredEvents, ...upcomingEvents];
  const displayEvents = allEvents.slice(0, 6); // Show max 6 events

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
            {featuredEvents.length > 0 ? 'Featured & Upcoming Events' : 'Upcoming Events'}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {displayEvents.length > 0
              ? 'Discover exciting events happening at your university. Register now to secure your spot!'
              : 'No events available at the moment. Check back soon for exciting upcoming events!'
            }
          </p>
        </div>

        {/* Events Grid */}
        {displayEvents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayEvents.map((event) => (
                <div key={event._id} className="card overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Event Banner */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                    {event.banner ? (
                      <img
                        src={event.banner}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <Calendar size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(getEventStatus(event))}`}>
                        {getEventStatus(event)}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    {/* Title and Organization */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {event.title}
                      </h3>
                      <p className="text-sm text-primary-600 font-medium">
                        {event.organizer?.name || 'Event Organizer'}
                      </p>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span>{formatDate(event.startDateTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        <span>{formatTime(event.startDateTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        <span>{event.venue?.name || event.venue || 'TBA'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users size={16} className="mr-2 text-gray-400" />
                        <span>{event.currentParticipants || 0}/{event.maxParticipants || 'Unlimited'} registered</span>
                      </div>
                    </div>

                    {/* Registration Deadline */}
                    {event.registrationDeadline && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Registration Deadline</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(event.registrationDeadline)}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <a
                        href={`/events/${event._id}`}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        <ExternalLink size={16} className="mr-1" />
                        View Details
                      </a>
                      {getEventStatus(event) === 'Registration Open' && (
                        <a
                          href={`/events/${event._id}/register`}
                          className="btn btn-outline btn-sm"
                        >
                          Register
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Events Button */}
            <div className="text-center mt-12">
              <a href="/events" className="btn btn-outline btn-lg">
                View All Events
              </a>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Calendar size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Events Available</h3>
            <p className="text-gray-500 mb-6">Check back soon for exciting upcoming events!</p>
            <a href="/events" className="btn btn-primary">
              Browse All Events
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
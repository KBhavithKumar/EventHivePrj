import React, { useState, useEffect } from 'react';
import { X, Bell, ExternalLink } from 'lucide-react';
import { eventsAPI, apiUtils } from '../../services/api';

const NotificationBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentNotification, setCurrentNotification] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      // Fetch recent events for notifications
      const [upcomingEvents, featuredEvents] = await Promise.all([
        eventsAPI.getUpcomingEvents(3),
        eventsAPI.getFeaturedEvents(2)
      ]);

      const notificationData = [];

      // Add upcoming events notifications
      upcomingEvents.data.data.events.forEach(event => {
        const eventDate = new Date(event.startDateTime);
        const daysUntil = Math.ceil((eventDate - new Date()) / (1000 * 60 * 60 * 24));

        if (daysUntil <= 7 && daysUntil > 0) {
          notificationData.push({
            id: event._id,
            title: `${event.title} - Starting Soon!`,
            message: `Join us in ${daysUntil} day${daysUntil > 1 ? 's' : ''} for this exciting ${event.category.toLowerCase()} event.`,
            link: `/events/${event._id}`,
            type: "event",
            organization: event.organizer?.name || "Event Organizer"
          });
        }
      });

      // Add featured events notifications
      featuredEvents.data.data.events.forEach(event => {
        if (event.registrationDeadline) {
          const deadline = new Date(event.registrationDeadline);
          const daysUntilDeadline = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));

          if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
            notificationData.push({
              id: `deadline-${event._id}`,
              title: `Registration Deadline Approaching`,
              message: `Only ${daysUntilDeadline} day${daysUntilDeadline > 1 ? 's' : ''} left to register for "${event.title}". Don't miss out!`,
              link: `/events/${event._id}`,
              type: "deadline",
              organization: event.organizer?.name || "Event Organizer"
            });
          }
        }
      });

      // Add default welcome notification if no events
      if (notificationData.length === 0) {
        notificationData.push({
          id: 'welcome',
          title: "Welcome to EventHive",
          message: "Your gateway to university events, workshops, and competitions. Stay updated with the latest happenings!",
          link: "/events",
          type: "welcome",
          organization: "EventHive"
        });
      }

      setNotifications(notificationData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback notification
      setNotifications([{
        id: 'fallback',
        title: "Welcome to EventHive",
        message: "Discover amazing events and opportunities at your university.",
        link: "/events",
        type: "welcome",
        organization: "EventHive"
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll through notifications
  useEffect(() => {
    if (notifications.length > 1) {
      const interval = setInterval(() => {
        setCurrentNotification((prev) => (prev + 1) % notifications.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [notifications.length]);

  if (!isVisible || isLoading) {
    return null;
  }

  if (notifications.length === 0) {
    return null;
  }

  const notification = notifications[currentNotification];

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          {/* Notification Icon */}
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex-shrink-0">
              <Bell size={20} className="text-yellow-300 animate-pulse" />
            </div>
            
            {/* Notification Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-semibold truncate">
                  {notification.title}
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {notification.organization}
                </span>
              </div>
              <p className="text-sm text-blue-100 truncate">
                {notification.message}
              </p>
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0 hidden sm:block">
              <a
                href={notification.link}
                className="inline-flex items-center space-x-1 text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors"
              >
                <span>View Details</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Navigation Dots */}
          {notifications.length > 1 && (
            <div className="flex items-center space-x-2 mx-4">
              {notifications.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentNotification(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentNotification
                      ? 'bg-yellow-300'
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1 rounded-md text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            aria-label="Close notification"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBar;

import React, { useState, useEffect } from 'react';
import { eventsAPI, apiUtils } from '../../services/api';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import HeroSection from '../../components/home/HeroSection';
import NotificationBar from '../../components/home/NotificationBar';
import FeaturesSection from '../../components/home/FeaturesSection';
import EventsSection from '../../components/home/EventsSection';
import OrganizationsSection from '../../components/home/OrganizationsSection';
import GallerySection from '../../components/home/GallerySection';

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventStats, setEventStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setIsLoading(true);

      const [featuredResponse, upcomingResponse, statsResponse] = await Promise.all([
        eventsAPI.getFeaturedEvents(6),
        eventsAPI.getUpcomingEvents(8),
        eventsAPI.getEventStats()
      ]);

      setFeaturedEvents(featuredResponse.data.data.events);
      setUpcomingEvents(upcomingResponse.data.data.events);
      setEventStats(statsResponse.data.data.stats);
    } catch (error) {
      console.error('Error fetching home data:', error);
      // Don't show error toast on homepage, just log it
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <NotificationBar />
      <main>
        <HeroSection stats={eventStats} />
        <FeaturesSection />
        <EventsSection
          featuredEvents={featuredEvents}
          upcomingEvents={upcomingEvents}
          isLoading={isLoading}
        />
        <OrganizationsSection />
        <GallerySection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

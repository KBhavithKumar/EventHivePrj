import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';
import { Camera, Calendar, ExternalLink } from 'lucide-react';

const GallerySection = () => {
  const [eventImages, setEventImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEventGallery();
  }, []);

  const fetchEventGallery = async () => {
    try {
      setIsLoading(true);
      // Fetch recent events that might have images
      const response = await eventsAPI.getPublicEvents({ limit: 6, hasImages: true });

      // Extract images from events (if they have gallery images)
      const images = response.data.data.events
        .filter(event => event.gallery && event.gallery.length > 0)
        .flatMap(event =>
          event.gallery.slice(0, 2).map(image => ({
            ...image,
            eventTitle: event.title,
            eventId: event._id
          }))
        )
        .slice(0, 6);

      setEventImages(images);
    } catch (error) {
      console.error('Error fetching event gallery:', error);
      setEventImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Event Gallery
            </h2>
            <p className="text-xl text-gray-600">
              Loading gallery...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-lg shadow-md animate-pulse">
                <div className="w-full h-48 bg-gray-300"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
            Event Gallery
          </h2>
          <p className="text-xl text-gray-600">
            {eventImages.length > 0
              ? 'Memorable moments from our amazing university events'
              : 'Gallery will showcase photos from upcoming events'
            }
          </p>
        </div>

        {eventImages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventImages.map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow group">
                <img
                  src={image.url}
                  alt={image.caption || `${image.eventTitle} - Image ${index + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-end">
                  <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="font-semibold text-sm mb-1">{image.eventTitle}</h4>
                    {image.caption && (
                      <p className="text-xs opacity-90">{image.caption}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Camera size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Gallery Images Yet</h3>
            <p className="text-gray-500 mb-6">Event photos will appear here as events are completed.</p>
            <a href="/events" className="btn btn-primary">
              Explore Upcoming Events
            </a>
          </div>
        )}

        {eventImages.length > 0 && (
          <div className="text-center mt-12">
            <a href="/gallery" className="btn btn-outline btn-lg">
              View Full Gallery
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;

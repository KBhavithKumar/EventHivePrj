import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              About EventHive
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionizing university event management with a comprehensive, user-friendly platform
            </p>
          </div>
          
          <div className="prose prose-lg max-w-4xl mx-auto">
            <p>
              EventHive is a comprehensive event management platform designed specifically for universities. 
              We understand the unique challenges that educational institutions face when organizing events, 
              from small departmental meetings to large-scale festivals.
            </p>
            
            <h2>Our Mission</h2>
            <p>
              To provide universities with a single, trusted system that simplifies workflows, 
              strengthens communication, and delivers a seamless experience for students, organizers, 
              volunteers, and administrators.
            </p>
            
            <h2>Why EventHive?</h2>
            <p>
              Traditional event management relies on scattered tools like Google Forms, WhatsApp, 
              and manual records, leading to fragmented data, miscommunication, and poor reporting. 
              EventHive solves this with a centralized platform that covers the entire event lifecycle.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;

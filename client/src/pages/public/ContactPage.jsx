import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-gray-600">
              Get in touch with our team for support or inquiries
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="card p-8">
              <form className="space-y-6">
                <div>
                  <label className="label">Name</label>
                  <input type="text" className="input" placeholder="Your full name" />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" placeholder="your.email@university.edu" />
                </div>
                <div>
                  <label className="label">Subject</label>
                  <input type="text" className="input" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input min-h-32" placeholder="Your message..."></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;

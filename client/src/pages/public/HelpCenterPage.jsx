import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const HelpCenterPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Help Center
            </h1>
            <p className="text-xl text-gray-600">
              Need assistance? Submit a support ticket and we'll help you out
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <div className="card p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Email</label>
                    <input type="email" className="input" placeholder="your.email@university.edu" />
                  </div>
                  <div>
                    <label className="label">Mobile Number</label>
                    <input type="tel" className="input" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                
                <div>
                  <label className="label">Role</label>
                  <select className="input">
                    <option value="">Select your role</option>
                    <option value="organization">Organization</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="participant">Participant</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Subject</label>
                  <input type="text" className="input" placeholder="Brief description of your issue" />
                </div>
                
                <div>
                  <label className="label">Issue Type</label>
                  <select className="input">
                    <option value="">Select issue type</option>
                    <option value="technical">Technical Issue</option>
                    <option value="application">Application/UI Issue</option>
                    <option value="account">Account Related</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Description</label>
                  <textarea className="input min-h-32" placeholder="Please describe your issue in detail..."></textarea>
                </div>
                
                <div>
                  <label className="label">Page/Module</label>
                  <select className="input">
                    <option value="">Where did you encounter this issue?</option>
                    <option value="home">Home Page</option>
                    <option value="events">Events Page</option>
                    <option value="registration">Registration</option>
                    <option value="dashboard">Dashboard</option>
                    <option value="profile">Profile</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <button type="submit" className="btn btn-primary w-full">
                  Submit Ticket
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

export default HelpCenterPage;

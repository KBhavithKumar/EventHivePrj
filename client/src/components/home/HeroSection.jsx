import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Award } from 'lucide-react';

const HeroSection = ({ stats }) => {
  return (
    <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-gray-900/30 to-black/60"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-heading font-bold leading-tight">
                Revolutionize
                <span className="block text-yellow-300">University Events</span>
              </h1>
              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                A comprehensive platform for end-to-end event management - from creation to reporting
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-lg text-blue-100 leading-relaxed">
                EventHive provides universities with a single, trusted system that simplifies workflows, 
                strengthens communication, and delivers a seamless experience for students, organizers, 
                volunteers, and administrators.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/signup"
                className="btn btn-lg bg-yellow-400 text-gray-900 hover:bg-yellow-300 border-0 font-semibold"
              >
                Get Started
                <ArrowRight size={20} className="ml-2" />
              </Link>
              <Link
                to="/about"
                className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-primary-700"
              >
                Learn More
              </Link>
            </div>

            {/* Real-time Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Calendar size={24} className="text-yellow-300" />
                </div>
                <div className="text-2xl font-bold">
                  {stats?.totalEvents || 0}
                </div>
                <div className="text-sm text-blue-200">Total Events</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users size={24} className="text-yellow-300" />
                </div>
                <div className="text-2xl font-bold">
                  {stats?.totalParticipants || 0}
                </div>
                <div className="text-sm text-blue-200">Participants</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Award size={24} className="text-yellow-300" />
                </div>
                <div className="text-2xl font-bold">
                  {stats?.totalOrganizations || 0}
                </div>
                <div className="text-sm text-blue-200">Organizations</div>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="space-y-6">
                {/* Mock Dashboard Preview */}
                <div className="bg-white rounded-lg p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-xs text-gray-500">EventHive Dashboard</div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-8 bg-primary-100 rounded"></div>
                      <div className="h-8 bg-green-100 rounded"></div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
                
                {/* Feature highlights */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <div className="font-semibold">Smart Registration</div>
                    <div className="text-xs text-blue-200">Eligibility-based</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <div className="font-semibold">QR Ticketing</div>
                    <div className="text-xs text-blue-200">Secure Access</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <div className="font-semibold">Real-time Analytics</div>
                    <div className="text-xs text-blue-200">Live Insights</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3 text-center">
                    <div className="font-semibold">Media Sharing</div>
                    <div className="text-xs text-blue-200">Post-event</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

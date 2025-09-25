import React from 'react';
import { 
  Calendar, 
  Users, 
  Shield, 
  QrCode, 
  Bell, 
  BarChart3, 
  Camera, 
  UserCheck 
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "Unified Event Management",
      description: "Complete lifecycle management from creation to reporting in one centralized platform.",
      color: "text-blue-600"
    },
    {
      icon: UserCheck,
      title: "Eligibility-Based Registration",
      description: "Smart filtering based on department, year, and program for targeted event access.",
      color: "text-green-600"
    },
    {
      icon: Users,
      title: "Volunteer Management",
      description: "Streamlined volunteer registration, role allocation, and coordination system.",
      color: "text-purple-600"
    },
    {
      icon: QrCode,
      title: "QR-Based Ticketing",
      description: "Secure access validation with QR code technology for seamless entry management.",
      color: "text-orange-600"
    },
    {
      icon: Bell,
      title: "Real-Time Notifications",
      description: "Instant email and in-app notifications for announcements and updates.",
      color: "text-red-600"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive event analytics and automated reporting for data-driven insights.",
      color: "text-indigo-600"
    },
    {
      icon: Camera,
      title: "Media Management",
      description: "Post-event photo and document sharing with organized media galleries.",
      color: "text-pink-600"
    },
    {
      icon: Shield,
      title: "Secure & Verified",
      description: "Robust security measures with user verification and role-based access control.",
      color: "text-teal-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
            Powerful Features for Modern Universities
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage university events efficiently, from small workshops to large-scale festivals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 bg-white"
              >
                <div className="mb-4">
                  <div className={`inline-flex p-3 rounded-lg bg-gray-50 group-hover:bg-primary-50 transition-colors`}>
                    <IconComponent size={24} className={`${feature.color} group-hover:text-primary-600 transition-colors`} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8">
            <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
              Ready to Transform Your Event Management?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join universities worldwide who trust EventHive for their event management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary btn-lg">
                Start Free Trial
              </button>
              <button className="btn btn-outline btn-lg">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

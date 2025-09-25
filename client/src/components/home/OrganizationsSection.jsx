import React, { useState, useEffect } from 'react';
import { organizationsAPI } from '../../services/api';
import { Building2, Users, Calendar } from 'lucide-react';

const OrganizationsSection = () => {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await organizationsAPI.getActiveOrganizations(6); // Get top 6 active organizations
      setOrganizations(response.data.data.organizations || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrgInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getOrgTypeColor = (type) => {
    const colors = {
      'DEPARTMENT': 'bg-blue-500',
      'CLUB': 'bg-green-500',
      'SOCIETY': 'bg-purple-500',
      'COMMITTEE': 'bg-orange-500',
      'ASSOCIATION': 'bg-red-500',
      'EXTERNAL': 'bg-gray-500'
    };
    return colors[type] || 'bg-blue-500';
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Registered Organizations
            </h2>
            <p className="text-xl text-gray-600">
              Loading organizations...
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center p-4 rounded-lg animate-pulse">
                <div className="w-16 h-16 bg-gray-300 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
            Registered Organizations
          </h2>
          <p className="text-xl text-gray-600">
            {organizations.length > 0
              ? `Trusted by ${organizations.length}+ university departments and organizations`
              : 'Building a community of university organizations'
            }
          </p>
        </div>

        {organizations.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {organizations.map((org) => (
              <div key={org._id} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="relative mb-3">
                  {org.logo ? (
                    <img
                      src={org.logo}
                      alt={org.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-lg ${getOrgTypeColor(org.type)} flex items-center justify-center text-white font-bold text-lg`}>
                      {getOrgInitials(org.name)}
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-primary-600 transition-colors">
                  {org.name}
                </span>
                <span className="text-xs text-gray-500 mt-1 capitalize">
                  {org.type?.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Organizations Yet</h3>
            <p className="text-gray-500 mb-6">Be the first organization to join EventHive!</p>
            <a href="/signup" className="btn btn-primary">
              Register Your Organization
            </a>
          </div>
        )}

        {/* Call to Action */}
        {organizations.length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Join Our Growing Community
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Register your organization and start creating amazing events for your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/signup" className="btn btn-primary">
                  Register Organization
                </a>
                <a href="/organizations" className="btn btn-outline">
                  View All Organizations
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default OrganizationsSection;

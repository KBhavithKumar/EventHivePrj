import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Terms & Conditions
            </h1>
          </div>
          
          <div className="prose prose-lg max-w-4xl mx-auto">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using EventHive, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>
            
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily use EventHive for personal, non-commercial 
              transitory viewing only.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;

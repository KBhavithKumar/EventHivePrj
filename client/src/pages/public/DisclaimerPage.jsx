import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Disclaimer
            </h1>
          </div>
          
          <div className="prose prose-lg max-w-4xl mx-auto">
            <p>
              The information contained in this website is for general information purposes only. 
              EventHive makes no representations or warranties of any kind, express or implied, 
              about the completeness, accuracy, reliability, suitability or availability with 
              respect to the website or the information, products, services, or related graphics 
              contained on the website for any purpose.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DisclaimerPage;


import React, { useEffect } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            
            <div className="prose max-w-none">
              <p className="mb-4">Effective Date: {currentDate}</p>
              
              <p className="mb-4">
                Tennexis, Inc. ("Tennexis", "we", "our", or "us") is committed to protecting your privacy. 
                This Privacy Policy describes how we collect, use, and disclose your information when you use our website, 
                application, or services (collectively, the "Services").
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
              <p className="mb-2 font-semibold">a. Information You Provide to Us:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Name, email address, phone number, billing information, and any other details you submit via forms or signups.</li>
                <li>Account and profile data when you register or update your profile.</li>
              </ul>
              
              <p className="mb-2 font-semibold">b. Automatically Collected Information:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>IP address, browser type, device identifiers, pages visited, time spent, and interactions.</li>
                <li>Cookies and similar tracking technologies to enhance your experience and analyze usage.</li>
              </ul>
              
              <p className="mb-2 font-semibold">c. Information from Third Parties:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>If you log in or connect through third-party services (like Google), we may receive limited data such as your name and email.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
              <p className="mb-2">We use your data to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Provide, operate, and maintain our Services.</li>
                <li>Process transactions and manage your account.</li>
                <li>Respond to customer service requests.</li>
                <li>Send service-related emails and occasional marketing (with your consent).</li>
                <li>Improve our platform through analytics and usage patterns.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">3. How We Share Your Information</h2>
              <p className="mb-2">We may share your information with:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><span className="font-medium">Service Providers:</span> Hosting, payment processing, customer support, and analytics providers.</li>
                <li><span className="font-medium">Legal Compliance:</span> If required by law or to protect our rights and users.</li>
                <li><span className="font-medium">Business Transfers:</span> If Tennexis is involved in a merger, acquisition, or asset sale.</li>
              </ul>
              <p className="mb-4">We do not sell your personal data.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">4. Your Rights and Choices</h2>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access, update, or delete your data.</li>
                <li>Opt out of marketing communications.</li>
                <li>Withdraw consent where processing is based on consent.</li>
              </ul>
              <p className="mb-4">For any request, email us at: support@tennexis.com</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">5. Data Retention</h2>
              <p className="mb-4">We retain your personal data as long as necessary to provide services, comply with legal obligations, and resolve disputes.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">6. International Users</h2>
              <p className="mb-4">Tennexis is based in the United States. By using our Services, you consent to processing and storage of your information in the U.S. and other jurisdictions.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">7. Security</h2>
              <p className="mb-4">We implement appropriate technical and organizational measures to protect your data. However, no system is completely secure.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">8. Children's Privacy</h2>
              <p className="mb-4">Our Services are not intended for individuals under 13. We do not knowingly collect data from children.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">9. Changes to This Policy</h2>
              <p className="mb-4">We may update this policy. Changes will be posted on this page with a revised "Effective Date."</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">10. Contact Us</h2>
              <p className="mb-4">
                Tennexis, Inc.<br />
                1209 Orange Street<br />
                Wilmington, DE 19801<br />
                United States<br />
                Email: support@tennexis.com
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

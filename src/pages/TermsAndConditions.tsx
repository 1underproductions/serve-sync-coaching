
import React, { useEffect } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const TermsAndConditions = () => {
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
            <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
            
            <div className="prose max-w-none">
              <p className="mb-4">Effective Date: {currentDate}</p>
              
              <p className="mb-4">
                These Terms and Conditions ("Terms") govern your use of the website, app, and services provided by 
                Tennexis, Inc., a company incorporated in Delaware, USA ("Tennexis", "we", or "us").
              </p>
              
              <p className="mb-6">
                By using our Services, you agree to these Terms. If you do not agree, do not use our Services.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">1. Use of Services</h2>
              <p className="mb-4">You must be at least 13 years old to use Tennexis. You agree to use our Services only for lawful purposes.</p>
              <p className="mb-4">You are responsible for all activity that occurs under your account. Do not share your login credentials.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">2. User Content</h2>
              <p className="mb-4">If you upload, submit, or share any content via the Services ("User Content"), you grant Tennexis a non-exclusive, worldwide, royalty-free license to use, store, reproduce, and display it solely to provide and improve the Services.</p>
              <p className="mb-4">You are solely responsible for your User Content. Do not upload anything unlawful, offensive, or infringing.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">3. Payment and Billing</h2>
              <p className="mb-4">If you subscribe to paid services, you agree to pay all fees as described at the time of purchase. All payments are non-refundable unless otherwise stated.</p>
              <p className="mb-4">You authorize Tennexis to charge your payment method on a recurring basis for ongoing services, unless canceled.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">4. Intellectual Property</h2>
              <p className="mb-4">All content on our site and app (except for User Content) is owned by or licensed to Tennexis and protected by copyright, trademark, and other laws.</p>
              <p className="mb-4">You may not reproduce, distribute, or exploit any part of our Services without prior written consent.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">5. Prohibited Conduct</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Use the Services for any unlawful or fraudulent purpose.</li>
                <li>Attempt to gain unauthorised access to Tennexis systems.</li>
                <li>Interfere with the operation of our Services.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">6. Termination</h2>
              <p className="mb-4">We may suspend or terminate your access if you violate these Terms or use the Services in a way that could harm Tennexis or others.</p>
              <p className="mb-4">You may cancel your account at any time by contacting support.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">7. Disclaimer of Warranties</h2>
              <p className="mb-4">Our Services are provided "as is" without warranties of any kind. We do not guarantee the Services will be error-free or uninterrupted.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">To the maximum extent permitted by law, Tennexis is not liable for any indirect, incidental, or consequential damages arising out of your use of the Services.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">9. Governing Law</h2>
              <p className="mb-4">These Terms are governed by the laws of the State of Delaware, USA. Any disputes will be resolved in the courts of Delaware.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">10. Changes to These Terms</h2>
              <p className="mb-4">We may modify these Terms from time to time. We'll notify you if changes are material. Continued use of the Services means you accept the updated Terms.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">11. Contact</h2>
              <p className="mb-4">
                For questions about these Terms, please contact:<br /><br />
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

export default TermsAndConditions;


import React, { useEffect } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const CookiesPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Cookies Policy</h1>
            
            <div className="prose max-w-none">
              <p className="mb-4">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">1. Introduction</h2>
              <p className="mb-4">This Cookies Policy explains how Tennexis ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website at <a href="https://tennexis.com" className="text-tennis-green-600 hover:underline">https://tennexis.com</a> ("Website"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">2. What are cookies?</h2>
              <p className="mb-4">Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
              <p className="mb-4">Cookies set by the website owner (in this case, Tennexis) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">3. Why do we use cookies?</h2>
              <p className="mb-4">We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Website. Third parties serve cookies through our Website for advertising, analytics, and other purposes.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">4. The types of cookies we use</h2>
              <p className="mb-4">The specific types of first and third-party cookies served through our Website and the purposes they perform are described below:</p>
              
              <h3 className="text-lg font-medium mt-5 mb-3">4.1 Essential cookies</h3>
              <p className="mb-4">These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the Website, you cannot refuse them without impacting how our Website functions.</p>
              
              <h3 className="text-lg font-medium mt-5 mb-3">4.2 Performance and functionality cookies</h3>
              <p className="mb-4">These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.</p>
              
              <h3 className="text-lg font-medium mt-5 mb-3">4.3 Analytics and customization cookies</h3>
              <p className="mb-4">These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you.</p>
              
              <h3 className="text-lg font-medium mt-5 mb-3">4.4 Advertising cookies</h3>
              <p className="mb-4">These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">5. How can you control cookies?</h2>
              <p className="mb-4">You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our Website though your access to some functionality and areas of our Website may be restricted.</p>
              <p className="mb-4">Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" className="text-tennis-green-600 hover:underline" target="_blank" rel="noopener noreferrer">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" className="text-tennis-green-600 hover:underline" target="_blank" rel="noopener noreferrer">www.allaboutcookies.org</a>.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">6. How often will we update this Cookies Policy?</h2>
              <p className="mb-4">We may update this Cookies Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookies Policy regularly to stay informed about our use of cookies and related technologies.</p>
              <p className="mb-4">The date at the top of this Cookies Policy indicates when it was last updated.</p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">7. Where can you get further information?</h2>
              <p className="mb-4">If you have any questions about our use of cookies or other technologies, please email us at <a href="mailto:support@tennexis.com" className="text-tennis-green-600 hover:underline">support@tennexis.com</a> or by post to:</p>
              <p className="mb-4">
                Tennexis<br />
                1209 Orange Street<br />
                Wilmington, DE 19801<br />
                United States
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiesPolicy;

import React, { useState } from 'react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <PublicNavbar />

      <div className="bg-white border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Inquiries & Support
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact the SupplyChainX Team
          </h1>
          <p className="mt-4 text-base text-slate-600 max-w-xl mx-auto">
            Have questions about system integration, deployment, or viva presentation features? Reach out to us.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Info Side */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Platform Headquarters</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed as an enterprise logistics platform for multi-city warehousing operations across Central and Western India.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Hub Office</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Plot 45, MIHAN SEZ, Wardha Road, Nagpur, Maharashtra</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Email Address</h4>
                  <p className="text-xs text-slate-600 mt-0.5">contact@supplychainx-enterprise.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Phone Support</h4>
                  <p className="text-xs text-slate-600 mt-0.5">+91 712 2589001 (Mon - Sat, 9am - 6pm)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Thank you for reaching out. We will get back to your inquiry promptly.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Your Full Name" placeholder="e.g. Rahul Sharma" required />
                <Input label="Email Address" type="email" placeholder="you@example.com" required />
                <Input label="Subject" placeholder="Enterprise Integration / Academic Demo" required />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we assist you with SupplyChainX?"
                    className="block w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button type="submit" variant="primary" size="md" icon={Send} className="w-full">
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

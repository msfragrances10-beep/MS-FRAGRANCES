import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { Textarea } from '@/src/components/ui/Textarea';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-5xl font-bold tracking-tighter uppercase md:text-7xl"
        >
          Contact Us
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-2xl text-lg text-neutral-500"
        >
          Have a question about a fragrance or an order? Our team of experts is here to help you find your perfect scent.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        {/* Contact Info */}
        <div className="space-y-12">
          <div className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight uppercase">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-black">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-semibold uppercase">Email</h3>
                  <p className="text-neutral-500">hello@msfragrances.com</p>
                  <p className="text-neutral-500">support@msfragrances.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-black">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-semibold uppercase">Phone</h3>
                  <p className="text-neutral-500">+1 (555) 000-1234</p>
                  <p className="text-neutral-500">Mon-Fri, 9am - 6pm EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-black">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-semibold uppercase">Boutique</h3>
                  <p className="text-neutral-500">123 Fragrance Lane</p>
                  <p className="text-neutral-500">Luxury District, NY 10001</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-black p-8 text-white">
            <div className="mb-4 flex items-center space-x-3">
              <MessageCircle size={24} />
              <h3 className="text-xl font-bold uppercase">Live Chat</h3>
            </div>
            <p className="mb-6 text-neutral-400">
              Need immediate assistance? Our fragrance consultants are available for live chat during business hours.
            </p>
            <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-black">
              Start Chat
            </Button>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase">First Name</label>
                <Input placeholder="John" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest uppercase">Last Name</label>
                <Input placeholder="Doe" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase">Email Address</label>
              <Input type="email" placeholder="john@example.com" required />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase">Subject</label>
              <Input placeholder="How can we help?" required />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest uppercase">Message</label>
              <Textarea 
                placeholder="Tell us more about your inquiry..." 
                className="min-h-[150px]"
                required 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full py-6 text-lg uppercase" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Send size={18} />
                  <span>Send Message</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

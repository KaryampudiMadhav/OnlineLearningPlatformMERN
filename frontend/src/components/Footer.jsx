/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiGithub } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert(`Thank you for subscribing with ${email}! 🎉`);
      setEmail('');
    }
  };

  const footerLinks = {
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
      { name: 'Blog', href: '#blog' },
    ],
    resources: [
      { name: 'All Courses', href: '#courses' },
      { name: 'Free Resources', href: '#resources' },
      { name: 'Become Instructor', href: '#instructor' },
      { name: 'Student Stories', href: '#stories' },
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Contact Us', href: '#contact' },
      { name: 'FAQs', href: '#faq' },
      { name: 'Terms of Service', href: '#terms' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'Accessibility', href: '#accessibility' },
      { name: 'Sitemap', href: '#sitemap' },
    ],
  };

  const socialLinks = [
    { icon: FiFacebook, href: '#', color: 'hover:text-blue-600' },
    { icon: FiTwitter, href: '#', color: 'hover:text-sky-500' },
    { icon: FiInstagram, href: '#', color: 'hover:text-pink-600' },
    { icon: FiLinkedin, href: '#', color: 'hover:text-blue-700' },
    { icon: FiGithub, href: '#', color: 'hover:text-gray-900 dark:hover:text-white' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
                StudySphere
              </h3>
              <p className="text-gray-400 mb-8 leading-relaxed text-lg">
                Empowering learners worldwide with high-quality education and transforming careers through accessible online learning.
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <FiMail className="text-blue-400 text-xl" />
                  <span className="text-base">support@studysphere.com</span>
                </div>
                <div className="flex items-center gap-4">
                  <FiPhone className="text-blue-400 text-xl" />
                  <span className="text-base">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-4">
                  <FiMapPin className="text-blue-400 text-xl" />
                  <span className="text-base">San Francisco, CA 94102</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="text-white font-bold mb-6 capitalize text-xl">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 transition-colors duration-300 text-base"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t-2 border-gray-800 pt-12 mb-12"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-white font-bold text-2xl mb-4">Subscribe to Our Newsletter</h4>
            <p className="text-gray-400 mb-8 text-lg">
              Get the latest courses, tips, and updates delivered to your inbox
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-8 py-5 rounded-full bg-gray-800 text-white border-2 border-gray-700 focus:outline-none focus:border-blue-500 transition-colors text-base placeholder-gray-500"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold hover:shadow-xl hover:shadow-blue-500/50 transition-all cursor-pointer text-base whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <div className="border-t-2 border-gray-800 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <p className="text-gray-400 text-base">
              © {currentYear} StudySphere. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex gap-5">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-gray-400 ${social.color} transition-colors duration-300`}
                  >
                    <IconComponent className="text-2xl" />
                  </motion.a>
                );
              })}
            </div>

            {/* Language Selector */}
            <select className="px-6 py-3 rounded-lg bg-gray-800 text-gray-300 border-2 border-gray-700 focus:outline-none focus:border-blue-500 text-base cursor-pointer">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Chinese</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

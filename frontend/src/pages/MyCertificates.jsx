import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import api from '../config/api';
import Certificate from '../components/Certificate';
import { Award, Download, Share2, ExternalLink, Calendar, CheckCircle } from 'lucide-react';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/certificates/my-certificates');
      setCertificates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setShowCertificate(true);
  };

  const handleShareLinkedIn = (certificate) => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      window.location.origin + '/verify-certificate/' + certificate.certificateId
    )}`;
    window.open(linkedInUrl, '_blank');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-900">My Certificates</h1>
          </div>
          <p className="text-gray-600">
            Your achievements and completed courses
          </p>
        </motion.div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Award className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No certificates yet
            </h2>
            <p className="text-gray-500 mb-6">
              Complete a course to earn your first certificate!
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Courses
              <ExternalLink className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate, index) => (
              <motion.div
                key={certificate._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Certificate Preview */}
                <div className="relative h-48 bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 p-6 flex flex-col justify-center items-center text-white">
                  <Award className="w-16 h-16 mb-3 opacity-90" />
                  <h3 className="text-lg font-bold text-center line-clamp-2">
                    {certificate.course?.title}
                  </h3>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                      {certificate.grade}
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="p-6 space-y-4">
                  {/* Course Info */}
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Completed: {formatDate(certificate.completionDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        {certificate.metadata?.completedLessons} of {certificate.metadata?.totalLessons} lessons
                      </span>
                    </div>
                  </div>

                  {/* Certificate ID */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Certificate ID</p>
                    <p className="text-sm font-mono font-semibold text-gray-900">
                      {certificate.certificateId}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleViewCertificate(certificate)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      View & Download
                    </button>
                    <button
                      onClick={() => handleShareLinkedIn(certificate)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      Share on LinkedIn
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Certificate Modal */}
        {showCertificate && selectedCertificate && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCertificate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Your Certificate</h2>
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <Certificate certificate={selectedCertificate} />
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCertificates;

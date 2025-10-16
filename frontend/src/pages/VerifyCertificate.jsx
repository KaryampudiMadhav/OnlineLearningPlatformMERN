import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../config/api';
import { Award, CheckCircle, XCircle, Calendar, User, BookOpen, Shield } from 'lucide-react';

const VerifyCertificate = () => {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  const verifyCertificate = useCallback(async () => {
    try {
      const response = await api.get(`/certificates/verify/${certificateId}`);
      if (response.data.valid) {
        setCertificate(response.data.data);
        setIsValid(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Certificate not found or invalid');
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  }, [certificateId]);

  useEffect(() => {
    verifyCertificate();
  }, [verifyCertificate]);

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
          <p className="text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {isValid ? (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
              <div className="mb-4">
                <CheckCircle className="w-20 h-20 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Certificate Verified</h1>
              <p className="text-green-100">This certificate is authentic and valid</p>
            </div>

            {/* Certificate Details */}
            <div className="p-8 space-y-6">
              {/* Certificate ID */}
              <div className="text-center pb-6 border-b border-gray-200">
                <div className="inline-flex items-center gap-2 bg-purple-50 px-6 py-3 rounded-full">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Certificate ID:</span>
                  <span className="font-mono font-bold text-purple-900">
                    {certificate.certificateId}
                  </span>
                </div>
              </div>

              {/* Student Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-purple-600" />
                    Student Information
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {certificate.user?.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-gray-900">{certificate.user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    Course Information
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Course Title</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {certificate.course?.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="text-gray-900">{certificate.course?.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Level</p>
                        <p className="text-gray-900 capitalize">{certificate.course?.level}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievement Details */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  Achievement Details
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Grade</p>
                    <p className="text-2xl font-bold text-purple-600">{certificate.grade}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Completion Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(certificate.completionDate)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(certificate.issueDate)}
                    </p>
                  </div>
                </div>

                {/* Additional Metadata */}
                <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Duration: {certificate.metadata?.courseDuration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      Lessons Completed: {certificate.metadata?.completedLessons}/
                      {certificate.metadata?.totalLessons}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructor */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Instructor</p>
                <p className="text-lg font-semibold text-gray-900">
                  {certificate.metadata?.instructorName || certificate.course?.instructor?.name}
                </p>
              </div>

              {/* Verification Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900 mb-1">Authenticity Verified</p>
                    <p className="text-sm text-green-700">
                      This certificate has been verified and is authentic. It was issued by our
                      platform and all information has been validated against our records.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Error Header */}
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8 text-white text-center">
              <div className="mb-4">
                <XCircle className="w-20 h-20 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Certificate Not Found</h1>
              <p className="text-red-100">Unable to verify this certificate</p>
            </div>

            {/* Error Details */}
            <div className="p-8 text-center space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-900 font-semibold mb-2">Verification Failed</p>
                <p className="text-red-700">{error}</p>
              </div>

              <div className="pt-4">
                <p className="text-gray-600 mb-2">Possible reasons:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• The certificate ID is incorrect or invalid</li>
                  <li>• The certificate may have been revoked</li>
                  <li>• The certificate does not exist in our system</li>
                </ul>
              </div>

              <p className="text-sm text-gray-500 pt-4">
                If you believe this is an error, please contact support with the certificate ID:
                <br />
                <span className="font-mono font-semibold text-gray-900">{certificateId}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;

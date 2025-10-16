import { useRef } from 'react';
import { jsPDF } from 'jspdf';
import { Award, Download, Share2 } from 'lucide-react';

const Certificate = ({ certificate }) => {
  const certificateRef = useRef(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background gradient effect (using rectangles)
    doc.setFillColor(139, 92, 246); // Purple
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');

    // Border
    doc.setDrawColor(139, 92, 246);
    doc.setLineWidth(2);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.rect(12, 12, pageWidth - 24, pageHeight - 24);

    // Certificate Header
    doc.setFontSize(40);
    doc.setTextColor(139, 92, 246);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Completion', pageWidth / 2, 45, { align: 'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', pageWidth / 2, 60, { align: 'center' });

    // Student Name
    doc.setFontSize(32);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    const studentName = certificate.user?.name || 'Student';
    doc.text(studentName, pageWidth / 2, 75, { align: 'center' });

    // Description
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the course', pageWidth / 2, 90, { align: 'center' });

    // Course Title
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    const courseTitle = certificate.course?.title || 'Course';
    
    // Handle long course titles
    const splitTitle = doc.splitTextToSize(courseTitle, pageWidth - 60);
    const titleY = splitTitle.length > 1 ? 102 : 105;
    doc.text(splitTitle, pageWidth / 2, titleY, { align: 'center' });

    // Course Details
    const detailsY = titleY + (splitTitle.length * 8) + 10;
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    
    const duration = certificate.metadata?.courseDuration || 'N/A';
    const lessons = `${certificate.metadata?.completedLessons || 0}/${certificate.metadata?.totalLessons || 0}`;
    const category = certificate.course?.category || 'General';
    
    doc.text(`Duration: ${duration} | Lessons: ${lessons} | Category: ${category}`, 
      pageWidth / 2, detailsY, { align: 'center' });

    // Grade
    doc.setFontSize(16);
    doc.setTextColor(139, 92, 246);
    doc.setFont('helvetica', 'bold');
    doc.text(`Grade: ${certificate.grade}`, pageWidth / 2, detailsY + 12, { align: 'center' });

    // Completion Date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(`Completed on: ${formatDate(certificate.completionDate)}`, 
      pageWidth / 2, detailsY + 22, { align: 'center' });

    // Bottom Section - Signatures
    const bottomY = pageHeight - 50;
    
    // Instructor Signature
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    const instructorName = certificate.metadata?.instructorName || 'Instructor';
    doc.text(instructorName, pageWidth * 0.3, bottomY, { align: 'center' });
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(pageWidth * 0.2, bottomY - 2, pageWidth * 0.4, bottomY - 2);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Instructor', pageWidth * 0.3, bottomY + 5, { align: 'center' });

    // Certificate ID and Date
    doc.text(`Issue Date: ${formatDate(certificate.issueDate)}`, 
      pageWidth * 0.7, bottomY, { align: 'center' });
    doc.line(pageWidth * 0.6, bottomY - 2, pageWidth * 0.8, bottomY - 2);
    doc.text('Authorized Signature', pageWidth * 0.7, bottomY + 5, { align: 'center' });

    // Certificate ID at bottom
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'italic');
    doc.text(`Certificate ID: ${certificate.certificateId}`, 
      pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Verification URL
    const verifyUrl = `${window.location.origin}/verify-certificate/${certificate.certificateId}`;
    doc.setFontSize(8);
    doc.text(`Verify at: ${verifyUrl}`, 
      pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save PDF
    const fileName = `Certificate_${certificate.course?.title?.replace(/[^a-z0-9]/gi, '_')}_${certificate.certificateId}.pdf`;
    doc.save(fileName);
  };

  const handleShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      window.location.origin + '/verify-certificate/' + certificate.certificateId
    )}`;
    window.open(linkedInUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Certificate Preview */}
      <div 
        ref={certificateRef}
        className="relative bg-gradient-to-br from-purple-50 via-white to-blue-50 border-8 border-purple-200 rounded-lg p-12 shadow-2xl"
        style={{ aspectRatio: '1.414/1' }}
      >
        {/* Decorative corners */}
        <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-purple-400 rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-purple-400 rounded-bl-lg"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
          {/* Award Icon */}
          <Award className="w-24 h-24 text-purple-600 mb-4" />

          {/* Title */}
          <div>
            <h1 className="text-5xl font-bold text-purple-800 mb-2">
              Certificate of Completion
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto"></div>
          </div>

          {/* Subtitle */}
          <p className="text-lg text-gray-600">This is to certify that</p>

          {/* Student Name */}
          <h2 className="text-4xl font-bold text-gray-900">
            {certificate.user?.name || 'Student Name'}
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600">
            has successfully completed the course
          </p>

          {/* Course Title */}
          <h3 className="text-3xl font-bold text-blue-700 max-w-2xl">
            {certificate.course?.title}
          </h3>

          {/* Course Details */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>Duration: {certificate.metadata?.courseDuration}</span>
            <span>•</span>
            <span>
              Lessons: {certificate.metadata?.completedLessons}/{certificate.metadata?.totalLessons}
            </span>
            <span>•</span>
            <span>Category: {certificate.course?.category}</span>
          </div>

          {/* Grade Badge */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg">
            Grade: {certificate.grade}
          </div>

          {/* Date */}
          <p className="text-gray-600">
            Completed on: {formatDate(certificate.completionDate)}
          </p>

          {/* Signatures */}
          <div className="flex justify-between w-full max-w-3xl mt-8 pt-8 border-t border-gray-300">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                {certificate.metadata?.instructorName}
              </p>
              <div className="w-40 h-px bg-gray-400 mt-2 mb-1"></div>
              <p className="text-sm text-gray-500">Instructor</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(certificate.issueDate)}
              </p>
              <div className="w-40 h-px bg-gray-400 mt-2 mb-1"></div>
              <p className="text-sm text-gray-500">Issue Date</p>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="text-xs text-gray-500 absolute bottom-6 left-0 right-0 text-center space-y-1">
            <p className="font-mono">Certificate ID: {certificate.certificateId}</p>
            <p>
              Verify at: {window.location.origin}/verify-certificate/{certificate.certificateId}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Share2 className="w-5 h-5" />
          Share on LinkedIn
        </button>
      </div>
    </div>
  );
};

export default Certificate;

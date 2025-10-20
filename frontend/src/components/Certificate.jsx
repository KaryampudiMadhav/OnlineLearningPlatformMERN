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

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Elegant Gold Border
    doc.setDrawColor(180, 120, 30); // Gold color
    doc.setLineWidth(3);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Inner decorative border
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(0.5);
    doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

    // Corner decorations
    const cornerSize = 10;
    const margin = 15;
    
    // Top left corner
    doc.line(margin, margin + cornerSize, margin, margin);
    doc.line(margin, margin, margin + cornerSize, margin);
    
    // Top right corner
    doc.line(pageWidth - margin - cornerSize, margin, pageWidth - margin, margin);
    doc.line(pageWidth - margin, margin, pageWidth - margin, margin + cornerSize);
    
    // Bottom left corner
    doc.line(margin, pageHeight - margin - cornerSize, margin, pageHeight - margin);
    doc.line(margin, pageHeight - margin, margin + cornerSize, pageHeight - margin);
    
    // Bottom right corner
    doc.line(pageWidth - margin - cornerSize, pageHeight - margin, pageWidth - margin, pageHeight - margin);
    doc.line(pageWidth - margin, pageHeight - margin, pageWidth - margin, pageHeight - margin - cornerSize);

    // Certificate Header
    doc.setFontSize(48);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE', pageWidth / 2, 40, { align: 'center' });
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.text('OF COMPLETION', pageWidth / 2, 50, { align: 'center' });

    // Decorative line
    doc.setDrawColor(180, 120, 30);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 30, 53, pageWidth / 2 + 30, 53);

    // Presented to
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('This certificate is proudly presented to', pageWidth / 2, 65, { align: 'center' });

    // Student Name - Large and prominent
    doc.setFontSize(36);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    const studentName = certificate.user?.name || 'Student';
    doc.text(studentName, pageWidth / 2, 80, { align: 'center' });
    
    // Underline for name
    const nameWidth = doc.getTextWidth(studentName);
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - nameWidth / 2, 82, pageWidth / 2 + nameWidth / 2, 82);

    // Description
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text('For successfully completing the comprehensive course and demonstrating', pageWidth / 2, 93, { align: 'center' });
    doc.text('exceptional understanding of', pageWidth / 2, 99, { align: 'center' });

    // Course Title
    doc.setFontSize(24);
    doc.setTextColor(30, 64, 175); // Blue
    doc.setFont('helvetica', 'bold');
    const courseTitle = certificate.course?.title || 'Course';
    const splitTitle = doc.splitTextToSize(courseTitle, pageWidth - 60);
    const titleY = 110;
    doc.text(splitTitle, pageWidth / 2, titleY, { align: 'center' });

    // Course Details Pills
    const detailsY = titleY + (splitTitle.length * 8) + 8;
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    doc.setFont('helvetica', 'normal');
    
    const duration = certificate.metadata?.courseDuration || 'N/A';
    const lessons = `${certificate.metadata?.completedLessons || 0}/${certificate.metadata?.totalLessons || 0} Lessons`;
    const category = certificate.course?.category || 'General';
    
    // Draw pill backgrounds
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    
    const pill1X = pageWidth / 2 - 50;
    const pill2X = pageWidth / 2;
    const pill3X = pageWidth / 2 + 50;
    
    doc.roundedRect(pill1X - 15, detailsY - 5, 28, 7, 3, 3, 'FD');
    doc.roundedRect(pill2X - 20, detailsY - 5, 38, 7, 3, 3, 'FD');
    doc.roundedRect(pill3X - 15, detailsY - 5, 28, 7, 3, 3, 'FD');
    
    doc.text(duration, pill1X, detailsY, { align: 'center' });
    doc.text(lessons, pill2X, detailsY, { align: 'center' });
    doc.text(category, pill3X, detailsY, { align: 'center' });

    // Grade Badge - Seal style
    const gradeY = detailsY + 15;
    doc.setFillColor(218, 165, 32); // Gold
    doc.circle(pageWidth / 2, gradeY, 15, 'F');
    
    doc.setFillColor(180, 120, 30); // Darker gold border
    doc.circle(pageWidth / 2, gradeY, 15, 'S');
    
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`GRADE: ${certificate.grade}`, pageWidth / 2, gradeY + 1, { align: 'center' });

    // Signatures Section
    const sigY = pageHeight - 35;
    
    // Instructor
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.8);
    doc.line(30, sigY, 80, sigY);
    
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    const instructorName = certificate.metadata?.instructorName || 'Instructor';
    doc.text(instructorName, 55, sigY + 6, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('COURSE INSTRUCTOR', 55, sigY + 11, { align: 'center' });

    // Date
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.8);
    doc.line(pageWidth - 80, sigY, pageWidth - 30, sigY);
    
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(formatDate(certificate.completionDate), pageWidth - 55, sigY + 6, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('DATE OF COMPLETION', pageWidth - 55, sigY + 11, { align: 'center' });

    // Certificate ID Footer
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(`Certificate ID: ${certificate.certificateId}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    doc.text(`Issued: ${formatDate(certificate.issueDate)}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Save PDF
    const fileName = `Certificate_${certificate.course?.title?.replace(/[^a-z0-9]/gi, '_')}_${certificate.user?.name?.replace(/[^a-z0-9]/gi, '_')}.pdf`;
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
      {/* Certificate Preview - Professional Design */}
      <div 
        ref={certificateRef}
        className="relative bg-white rounded-xl shadow-2xl overflow-hidden"
        style={{ aspectRatio: '1.414/1', maxWidth: '100%' }}
      >
        {/* Elegant Border Frame */}
        <div className="absolute inset-0 p-6">
          <div className="w-full h-full border-4 border-amber-600 rounded-lg relative">
            {/* Inner decorative border */}
            <div className="absolute inset-2 border-2 border-amber-400/50 rounded-lg"></div>
            
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-16 h-16">
              <div className="absolute top-4 left-4 w-8 h-8 border-t-3 border-l-3 border-amber-600"></div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16">
              <div className="absolute top-4 right-4 w-8 h-8 border-t-3 border-r-3 border-amber-600"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-16 h-16">
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-3 border-l-3 border-amber-600"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16">
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-3 border-r-3 border-amber-600"></div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative flex flex-col items-center justify-between h-full p-12 md:p-16">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Award Icon with elegant styling */}
            <div className="relative">
              <div className="absolute inset-0 bg-amber-400 blur-2xl opacity-20 rounded-full"></div>
              <Award className="relative w-20 h-20 text-amber-600" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 tracking-wide">
                CERTIFICATE
              </h1>
              <p className="text-lg md:text-xl font-serif text-gray-600 tracking-widest">
                OF COMPLETION
              </p>
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto"></div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col items-center text-center space-y-5 my-6">
            {/* Presented to text */}
            <p className="text-base md:text-lg text-gray-600 font-light italic">
              This certificate is proudly presented to
            </p>

            {/* Student Name - Large and Prominent */}
            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-gray-900 px-6">
                {certificate.user?.name || 'Student'}
              </h2>
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-3"></div>
            </div>

            {/* Recognition text */}
            <p className="text-sm md:text-base text-gray-600 max-w-xl px-4 leading-relaxed">
              For successfully completing the comprehensive course and demonstrating
              exceptional understanding of
            </p>

            {/* Course Title */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-800 max-w-2xl px-6 leading-tight">
              {certificate.course?.title}
            </h3>

            {/* Course Details - Elegant Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs md:text-sm px-4 mt-4">
              <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full border border-gray-300">
                {certificate.metadata?.courseDuration}
              </span>
              <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full border border-gray-300">
                {certificate.metadata?.completedLessons}/{certificate.metadata?.totalLessons} Lessons
              </span>
              <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full border border-gray-300">
                {certificate.course?.category}
              </span>
            </div>

            {/* Grade Badge - Seal Style */}
            <div className="relative mt-4">
              <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 rounded-full"></div>
              <div className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white px-8 py-3 rounded-full shadow-lg border-2 border-amber-700">
                <span className="text-xl md:text-2xl font-bold tracking-wider">
                  GRADE: {certificate.grade}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Section - Signatures */}
          <div className="w-full max-w-3xl mt-8">
            <div className="flex justify-between items-end px-8">
              {/* Instructor Signature */}
              <div className="text-center space-y-2">
                <div className="w-40 border-t-2 border-gray-800 mb-2"></div>
                <p className="text-base font-semibold text-gray-900">
                  {certificate.metadata?.instructorName || 'Instructor'}
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Course Instructor
                </p>
              </div>

              {/* Date */}
              <div className="text-center space-y-2">
                <div className="w-40 border-t-2 border-gray-800 mb-2"></div>
                <p className="text-base font-semibold text-gray-900">
                  {formatDate(certificate.completionDate)}
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  Date of Completion
                </p>
              </div>
            </div>

            {/* Certificate ID Footer */}
            <div className="text-center mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-mono">
                Certificate ID: {certificate.certificateId}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Issued: {formatDate(certificate.issueDate)}
              </p>
            </div>
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

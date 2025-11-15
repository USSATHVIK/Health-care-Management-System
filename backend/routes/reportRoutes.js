import express from 'express';
import xlsx from 'xlsx';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import Claim from '../models/Claim.js';

const router = express.Router();

// Rate limiter for email sending
const emailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many email requests. Please try again later.' },
});

// Helper function to generate reports based on format
const generateReport = async (reportType, format) => {
    // Fetch real data from database based on report type
    let claimsData = [];
    
    try {
        const claims = await Claim.find({}).sort({ createdAt: -1 });
        
        // Transform data based on report type
        switch (reportType) {
            case 'claims-performance':
                claimsData = claims.map(claim => ({
                    'Claim ID': claim.claimId || claim._id.toString(),
                    'Patient': claim.patientName || 'N/A',
                    'Doctor': claim.doctorName || 'N/A',
                    'Amount': claim.amount || 0,
                    'Status': claim.status || 'pending',
                    'Submission Date': claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'N/A',
                    'Approval Date': claim.updatedAt && claim.status === 'approved' ? new Date(claim.updatedAt).toLocaleDateString() : 'N/A'
                }));
                break;
            case 'approval-rates':
                const total = claims.length;
                const approved = claims.filter(c => c.status === 'approved').length;
                const rejected = claims.filter(c => c.status === 'rejected').length;
                const pending = claims.filter(c => c.status === 'pending' || c.status === 'under review').length;
                claimsData = [
                    { 'Metric': 'Total Claims', 'Count': total, 'Percentage': '100%' },
                    { 'Metric': 'Approved', 'Count': approved, 'Percentage': total > 0 ? `${((approved/total)*100).toFixed(2)}%` : '0%' },
                    { 'Metric': 'Rejected', 'Count': rejected, 'Percentage': total > 0 ? `${((rejected/total)*100).toFixed(2)}%` : '0%' },
                    { 'Metric': 'Pending', 'Count': pending, 'Percentage': total > 0 ? `${((pending/total)*100).toFixed(2)}%` : '0%' }
                ];
                break;
            case 'payment-timelines':
                const approvedClaims = claims.filter(c => c.status === 'approved');
                claimsData = approvedClaims.map(claim => ({
                    'Claim ID': claim.claimId || claim._id.toString(),
                    'Patient': claim.patientName || 'N/A',
                    'Amount': claim.amount || 0,
                    'Submission Date': claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'N/A',
                    'Approval Date': claim.updatedAt ? new Date(claim.updatedAt).toLocaleDateString() : 'N/A',
                    'Days to Approve': claim.createdAt && claim.updatedAt ? 
                        Math.floor((new Date(claim.updatedAt) - new Date(claim.createdAt)) / (1000 * 60 * 60 * 24)) : 'N/A',
                    'Payment Status': claim.paymentStatus || 'Pending'
                }));
                break;
            case 'fraud-detection':
                claimsData = claims.map(claim => ({
                    'Claim ID': claim.claimId || claim._id.toString(),
                    'Patient': claim.patientName || 'N/A',
                    'Amount': claim.amount || 0,
                    'Status': claim.status || 'pending',
                    'Rejection Reason': claim.rejectionReason || claim.doctorReview || 'N/A',
                    'Dispute Status': claim.disputeMessage ? 'Disputed' : 'No Dispute',
                    'Transaction Hash': claim.transactionHash || 'N/A'
                }));
                break;
            default:
                // Default: all claims
                claimsData = claims.map(claim => ({
                    'Claim ID': claim.claimId || claim._id.toString(),
                    'Patient': claim.patientName || 'N/A',
                    'Doctor': claim.doctorName || 'N/A',
                    'Amount': claim.amount || 0,
                    'Status': claim.status || 'pending',
                    'Submission Date': claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'N/A'
                }));
        }
    } catch (error) {
        console.error('Error fetching claims data:', error);
        // Fallback to empty data if database fetch fails
        claimsData = [];
    }

    // Generate reports based on format (same logic as before)
    if (format === 'CSV') {
        const ws = xlsx.utils.json_to_sheet(claimsData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Claims Report');
        return xlsx.write(wb, { bookType: 'csv', type: 'buffer' });
    }

    if (format === 'Excel') {
        const ws = xlsx.utils.json_to_sheet(claimsData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Claims Report');
        return xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
    }

    if (format === 'PDF') {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument();
            const buffer = [];
            doc.on('data', (chunk) => buffer.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffer)));
            doc.on('error', (err) => reject(err));
            
            doc.fontSize(20).text(`${reportType.replace('-', ' ').toUpperCase()} Report`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
            doc.moveDown(2);
            
            if (claimsData.length === 0) {
                doc.text('No data available for this report.');
            } else {
                // Get column headers from first object
                const headers = Object.keys(claimsData[0]);
                let yPosition = doc.y;
                
                // Draw table headers
                headers.forEach((header, i) => {
                    doc.fontSize(10).font('Helvetica-Bold')
                        .text(header, 50 + (i * 100), yPosition, { width: 100 });
                });
                
                yPosition += 20;
                doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
                yPosition += 10;
                
                // Draw table rows
                claimsData.forEach((row) => {
                    headers.forEach((header, i) => {
                        const value = row[header] !== undefined ? String(row[header]) : 'N/A';
                        doc.fontSize(9).font('Helvetica')
                            .text(value, 50 + (i * 100), yPosition, { width: 100 });
                    });
                    yPosition += 20;
                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 50;
                    }
                });
            }
            
            doc.end();
        });
    }

    return null;
};

// Generate Report Route
router.post('/generate', async (req, res) => {
    const { reportType, format } = req.body;

    if (!reportType || !format) {
        return res.status(400).json({ error: 'Missing reportType or format in request.' });
    }

    try {
        const reportBuffer = await generateReport(reportType, format);
        if (!reportBuffer) {
            return res.status(500).json({ error: 'Error generating the report' });
        }

        res.setHeader('Content-Type', format === 'PDF' ? 'application/pdf' : 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.${format.toLowerCase()}"`);
        res.send(reportBuffer);
    } catch (error) {
        console.error('Error generating the report:', error);
        res.status(500).json({ error: 'Error generating the report' });
    }
});

// Send Email Route
router.post('/send-email', emailLimiter, async (req, res) => {
    const { reportType, format, email } = req.body;

    if (!email || !reportType || !format) {
        return res.status(400).json({ error: 'Missing email, reportType, or format in request.' });
    }

    try {
        const reportBuffer = await generateReport(reportType, format);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `${reportType} Report`,
            text: 'Please find the attached report.',
            attachments: [{ filename: `${reportType}_report.${format.toLowerCase()}`, content: reportBuffer }],
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Error sending email' });
    }
});

export default router;

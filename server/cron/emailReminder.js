const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const nodemailer = require('nodemailer');

// Cấu hình gửi mail (Dùng Gmail App Password)
const transporter = nodemailer.createTransport({ /* ...config... */ });

// Chạy vào 7:00 AM mỗi ngày
cron.schedule('0 7 * * *', async () => {
  console.log('Running Email Job...');
  
  const today = new Date();
  today.setHours(0,0,0,0); // Đưa về đầu ngày

  // Tìm những đơn mượn có hạn trả là hôm nay VÀ chưa trả
  const dueTransactions = await Transaction.find({
    dueDate: { 
      $gte: today, 
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
    },
    isReturned: false
  }).populate('bookId');

  // Gửi mail cho từng người
  dueTransactions.forEach(async (record) => {
    const mailOptions = {
      from: 'library@system.com',
      to: record.studentEmail,
      subject: '📚 Nhắc nhở trả sách thư viện',
      text: `Chào ${record.studentName}, hôm nay là hạn trả cuốn sách "${record.bookId.title}". Vui lòng trả sách đúng hạn nhé!`
    };
    await transporter.sendMail(mailOptions);
  });
});
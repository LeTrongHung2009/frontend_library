// server/utils/scheduler.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const LibraryCode = require('../models/LibraryCode');
const { getTenantModel } = require('../models/DynamicModels');
const sendEmail = require('./mailer');

const initScheduler = () => {
  // Chạy mỗi 1 giờ (có thể đổi thành '*/5 * * * *' cho 5 phút)
  cron.schedule('0 * * * *', async () => {
    console.log('--- Running Cron Job: Check Expired Loans ---');
    try {
      const libraries = await LibraryCode.find({ isActive: true });
      
      for (const lib of libraries) {
        const LoanModel = getTenantModel(lib.code, 'loans');
        const now = new Date();
        
        // Tìm các khoản vay hết hạn hôm nay và chưa trả
        // Logic đơn giản: dueDate < now và chưa trả
        const overdueLoans = await LoanModel.find({
          dueDate: { $lte: now },
          isReturned: false
        });

        for (const loan of overdueLoans) {
            // Gửi mail (tránh spam liên tục bằng cách check log nếu cần, ở đây làm đơn giản)
             await sendEmail(
                loan.email,
                `[Thư viện ${lib.name}] Thông báo quá hạn`,
                `Chào bạn, cuốn sách "${loan.bookTitle}" bạn mượn đã quá hạn. Vui lòng trả sách.`
             );
        }
      }
    } catch (error) {
      console.error('Cron job error:', error);
    }
  });
};

module.exports = initScheduler;
const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    // ID người dùng nhập vào (MSSV/CCCD...)
    studentId: { 
        type: String, 
        required: true,
        trim: true // Tự động xóa khoảng trắng thừa đầu cuối
    },
    studentEmail: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date
    },
    image: {
        type: String
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }],
    libraryCode: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'borrowing'
    },
    borrowDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Borrow', borrowSchema);
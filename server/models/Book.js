const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'Kỹ năng'
    },
    image: {
        type: String
    },
    libraryCode: {
        type: String,
        required: true
    },
    // --- THÊM DÒNG NÀY ĐỂ LƯU TRẠNG THÁI SÁCH ---
    status: {
        type: String,
        default: 'Sẵn sàng' // Mặc định là Sẵn sàng
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Book', bookSchema);
// models/People.js

const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    father: {
        type: String,
        required: true
    },
    mother: {
        type: String,
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    treat: {
        type: String,
        enum: ['yes', 'no', 'other'],
        required: true
    },
    photo: {
        type: String, // URL or path to the uploaded photo
        required: true
    }
});

// Export the Profile model
module.exports = mongoose.model('People', ProfileSchema);
const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    diagnosis: { type: String, required: true },
    location: { type: String, required: true },
    county: { type: String, required: true }
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;
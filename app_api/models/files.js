const mongoose = require('mongoose');

const { Schema } = mongoose;

const fileModelSchema = new Schema({
    name: String,
    description: String,
    path: String,
    vendorId: String
})

mongoose.model('File', fileModelSchema);
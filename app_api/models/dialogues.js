const mongoose = require('mongoose');

const { Schema } = mongoose;

const dialoguesModelSchema = new Schema({
    name: String,
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    llm: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LLM'
    },
    file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
    instructions: String,
    vendorId: String
})

mongoose.model('Dialog', dialoguesModelSchema);
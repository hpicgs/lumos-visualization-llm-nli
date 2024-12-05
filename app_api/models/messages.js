const mongoose = require('mongoose');

const { Schema } = mongoose;

const messagesModelSchema = new Schema({
    from: String,
    content: String,
    type: {
        type: String,
        enum: ['text', 'code']
    },
    nli: Object,
})

mongoose.model('Message', messagesModelSchema);
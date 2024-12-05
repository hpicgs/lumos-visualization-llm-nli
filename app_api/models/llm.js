const mongoose = require('mongoose');

const { Schema } = mongoose;

const llmModelSchema = new Schema({
    name: String,
    description: String,
    provider: String,
    model: String,
    prompt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prompt'
    },
    vendorId: String
    // options
})

mongoose.model('LLM', llmModelSchema);
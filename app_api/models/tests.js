const mongoose = require('mongoose');

const { Schema } = mongoose;

const testsSchema = new Schema({
    name: String,
    collection: String,
    instructions_prompt: String,
    model: String,
    visualization: String,
    question_item: String,
    task: String, // e.g. "find extremum"
    visual: String, // e.g. yes / no
    question: String,
    answer: String,
    dataset: String,
    comment: String,
    parameter: Object,
    status: {
        type: String,
        enum: ['passed', 'failed', 'pending', 'running', 'sleeping']
    },
    log: String,
    messages: [mongoose.model('Message').schema]
});

mongoose.model('Test', testsSchema);
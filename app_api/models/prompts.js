const mongoose = require('mongoose');

const { Schema } = mongoose;

const promptsSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: async function (name) {
                const prompt = await this.constructor.findOne({ name: name });
                if (prompt) {
                    return false
                }
                return true;
            },
            message: props => 'The specified name is already in use.'
        }
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['prompt', 'block']
    },
    subprompts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prompt'
    }]
});

mongoose.model('Prompt', promptsSchema);
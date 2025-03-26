const mongoose = require('mongoose');
const m2s = require('mongoose-to-swagger');

const LLM = mongoose.model('LLM');
const Dialog = mongoose.model('Dialog');
const Test = mongoose.model('Test');
const Prompt = mongoose.model('Prompt');
const File = mongoose.model('File');

module.exports = {
    LLM: m2s(LLM),
    Dialog: m2s(Dialog),
    Test: m2s(Test),
    Prompt: m2s(Prompt),
    File: m2s(File)
};
const { error, handleError } = require('../util/error')

const llmModelOptions = {
    OpenAI: ["gpt-4o", "gpt-4o-mini"]
}
const llmOptions = (req, res) => {
    res
        .status(200)
        .json(llmModelOptions);
}

module.exports = {
    llmOptions
}
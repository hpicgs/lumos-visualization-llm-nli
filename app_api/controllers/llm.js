const mongoose = require('mongoose');
const Dialog = mongoose.model('Dialog')
const LLM = mongoose.model('LLM');
const Prompt = mongoose.model('Prompt')
const { client: OpenAIclient } = require('../util/openai')
const { error, handleError } = require('../util/error')

const llmReadAll = (req, res) => {
    LLM
        .find({})
        .exec()
        .then((llms) => {
            res
                .status(200)
                .json(llms);
        }).catch((err) => {
            res
                .status(500)
                .json(err);
        });

}

const llmCreateOne = (req, res) => {
    const temperature = req.body.temperature ? req.body.temperature : 1;

    Prompt
        .findById(req.body.prompt)
        .exec()
        .then((prompt) => {
            if (!prompt) {
                return error(400, "Prompt not found / Invalid Prompt Id");
            }

            return OpenAIclient.beta.assistants.create({
                name: req.body.name,
                instructions: prompt.content,
                tools: [{ type: 'code_interpreter' }],
                model: req.body.model, // "gpt-4o",
                temperature: parseFloat(temperature)
            });
        })
        .then((assistant) => {
            return LLM.create(
                {
                    name: req.body.name,
                    description: req.body.description,
                    provider: req.body.provider,
                    model: req.body.model,
                    temperature: temperature,
                    prompt: req.body.prompt,
                    vendorId: assistant.id
                });
        })
        .then((llm) => {
            res
                .status(201)
                .json(llm);
        })
        .catch((err) => {
            console.log(err)
            handleError(err, res);
        });
}

const llmReadOne = (req, res) => {
    LLM
        .findById(req.params.llmId)
        .exec()
        .then((llm) => {
            if (!llm) {
                return error(404, "llm not found");
            }
            res
                .status(200)
                .json(llm);
        })
        .catch((err) => {
            handleError(err, res);
        });
}

const llmUpdateOne = (req, res) => { }

const llmDeleteOne = (req, res) => {
    Dialog
        .find({ llm: req.params.llmId })
        .exec()
        .then((dialogues) => {
            return Promise.all(
                dialogues.map((dialog) => OpenAIclient.beta.threads.del(dialog.vendorId))
            )
        })
        .then((threads) => {
            return Promise.all([
                LLM
                    .findByIdAndDelete(req.params.llmId)
                    .exec(),
                Dialog
                    .deleteMany({ llm: req.params.llmId })
                    .exec()])
        })
        .then(([llm, dialogues]) => {
            return OpenAIclient.beta.assistants.del(llm.vendorId)
        })
        .then((assistant) => {
            res
                .status(204)
                .json(null);
        })
        .catch((err) => {
            handleError(err, res);
        });
}

module.exports = {
    llmReadAll,
    llmCreateOne,
    llmReadOne,
    llmUpdateOne,
    llmDeleteOne
}
const mongoose = require('mongoose');
const Prompt = mongoose.model('Prompt')
const { error, handleError } = require('../util/error')

const promptReadAll = (req, res) => {
    let query = {}
    if (req.query.type) {
        query["type"] = req.query.type
    }

    Prompt
        .find(query)
        .exec()
        .then((prompts) => {
            res
                .status(200)
                .json(prompts);
        }).catch((err) => {
            handleError(err, res)
        });

}

const promptCreateOne = (req, res) => {
    Prompt
        .create({
            name: req.body.name,
            content: req.body.content,
            type: req.body.type,
            subprompts: req.body.subprompts
        })
        .then((prompt) => {
            res
                .status(201)
                .json(prompt)
        })
        .catch((err) => {
            handleError(err, res);
        });
}

const promptReadOne = (req, res) => {
    Prompt
        .findById(req.params.promptId)
        .exec()
        .then((prompt) => {
            if (!prompt) {
                return error(404, "prompt not found");
            }
            res
                .status(200)
                .json(prompt);
        })
        .catch((err) => {
            handleError(err, res);
        });
}

const promptUpdateOne = (req, res) => { }

const promptDeleteOne = (req, res) => {
    Prompt
        .findByIdAndDelete(req.params.promptId)
        .exec()
        .then((prompt) => {
            if (!prompt) {
                return error(404, "prompt not found");
            }
            res
                .status(204)
                .json(null);
        })
        .catch((err) => {
            handleError(err, res);
        });
}

module.exports = {
    promptReadAll,
    promptCreateOne,
    promptReadOne,
    promptUpdateOne,
    promptDeleteOne
}
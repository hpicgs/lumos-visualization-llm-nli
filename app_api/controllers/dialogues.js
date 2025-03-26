const mongoose = require('mongoose');
const Dialog = mongoose.model('Dialog')
const File = mongoose.model('File')
const { client: OpenAIclient } = require('../util/openai')
const { error, handleError } = require('../util/error')

const dialogInfo = (req, res) => {

}

const dialogReadAll = (req, res) => {
    Dialog
        .find({ llm: req.params.llmId })
        .select("-messages")
        .exec()
        .then((dialogues) => {
            res
                .status(200)
                .json(dialogues);
        }).catch((err) => {
            handleError(err, res)
        });
}

const dialogCreateOne = async (req, res) => {
    const args = []
    if (req.body.file) {
        const file = await File.findById(req.body.file).exec()
        args.push({
            "tool_resources": {
                "code_interpreter": {
                    "file_ids": [file.vendorId]
                }
            }
        });
    }

    OpenAIclient.beta.threads
        .create(...args)
        .then((emptyThread) => {
            return Dialog
                .create({
                    name: req.body.name,
                    llm: req.params.llmId,
                    file: req.body.file,
                    instructions: req.body.instructions,
                    vendorId: emptyThread.id
                })
        })
        .then((dialog) => {
            res
                .status(201)
                .json(dialog)
        })
        .catch((err) => {
            console.log(err)
            handleError(err, res);
        });
}

const dialogReadOne = (req, res) => {
    Dialog
        .findById(req.params.dialogId)
        .exec()
        .then((dialog) => {
            if (!dialog) {
                return error(404, "dialog not found");
            }
            res
                .status(200)
                .json(dialog);
        })
        .catch((err) => {
            handleError(err, res);
        });
}


const dialogDeleteOne = (req, res) => {
    Dialog
        .findById(req.params.dialogId)
        .exec()
        .then((dialog) => {
            if (!dialog) {
                return error(404, "dialog not found");
            }
            return OpenAIclient.beta.threads
                .del(dialog.vendorId)
        })
        .then((response) => {
            if (response.deleted != true) {
                return error(500, "not deleted on OpenAI api")
            }
            return Dialog
                .findByIdAndDelete(req.params.dialogId)
                .exec()
        })
        .then((dialog) => {
            res
                .status(204)
                .json(null);
        })
        .catch((err) => {
            handleError(err, res);
        });
}

module.exports = {
    dialogInfo,
    dialogReadAll,
    dialogCreateOne,
    dialogReadOne,
    dialogDeleteOne
}
const mongoose = require('mongoose');
const File = mongoose.model('File');
const fs = require('fs')
const { client: OpenAIclient } = require('../util/openai')
const { error, handleError } = require('../util/error');

const fileReadAll = (req, res) => {
    let query = {}
    if (req.query.name) {
        query["name"] = req.query.name
    }

    File
        .find(query)
        .select("-path")
        .exec()
        .then((files) => {
            res
                .status(200)
                .json(files);
        }).catch((err) => {
            handleError(err, res)
        });
}

// TODO use original filename for openai upload?
const fileCreateOne = (req, res) => {
    if (!req.file) {
        return res
            .status(400)
            .json({ message: "no file uploaded" });
    }

    OpenAIclient.files
        .create({
            file: fs.createReadStream(req.file.path),
            purpose: "assistants"
        })
        .then((file) => {
            return File
                .create({
                    name: req.file.originalname,
                    description: req.body.description,
                    path: req.file.path,
                    vendorId: file.id
                })
        })
        .then((file) => {
            res
                .status(201)
                .json(file)
        })
        .catch((err) => {
            handleError(err, res);
        });
}

const fileReadOne = (req, res) => {
    File
        .findById(req.params.fileId)
        .exec()
        .then((file) => {
            if (!file) {
                return error(404, "file not found");
            }
            res.download(file.path, file.name, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                    return error(404, "file not found");
                }
            });
        })
        .catch((err) => {
            handleError(err, res);
        });
}

const fileDeleteOne = (req, res) => {
    File
        .findById(req.params.fileId)
        .exec()
        .then((file) => {
            if (!file) {
                return error(404, "file not found");
            }
            return Promise.all([
                OpenAIclient.files.del(file.vendorId),
                fs.promises.unlink(file.path)
            ])
        })
        .then(([openAiResponse, fsStatus]) => {
            if (openAiResponse.deleted != true) {
                return error(500, "not deleted on OpenAI api")
            }
            File
                .findByIdAndDelete(req.params.fileId)
                .exec()
        })
        .then((file) => {
            res
                .status(204)
                .json(null);
        })
        .catch((err) => {
            handleError(err, res);
        });
}

module.exports = {
    fileReadAll,
    fileCreateOne,
    fileReadOne,
    fileDeleteOne
}
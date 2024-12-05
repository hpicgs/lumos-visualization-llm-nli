const mongoose = require('mongoose');
const Test = mongoose.model('Test');
const testRunQueue = require('../util/queue')

const testsMetaInformation = async (req, res) => {
    try {
        const collections = await Test.distinct("collection").exec();
        const visualizations = await Test.distinct("visualization").exec();

        const info = {
            collection: collections,
            visualization: visualizations
        }

        return res
            .status(200)
            .json(info);
    } catch (error) {
        res
            .status(400)
            .json(error);
    }
}

const testsReadAll = async (req, res) => {
    let query = {}
    if (req.query.collection) {
        query["collection"] = req.query.collection
    }
    if (req.query.visualization) {
        query["visualization"] = req.query.visualization
    }
    if (req.query.status) {
        query["status"] = req.query.status
    }

    try {
        const tests = await Test.find(query).select("-path").exec()

        return res
            .status(200)
            .json(tests);

    } catch (error) {
        res
            .status(400)
            .json(error);
    }
}

const testsCreateOne = async (req, res) => {
    const testData = {
        name: req.body.name,
        collection: req.body.collection,
        instructions_prompt: req.body.instructions_prompt,
        model: req.body.model,
        visualization: req.body.visualization,
        question_item: req.body.question_item,
        task: req.body.task,
        question: req.body.question,
        answer: req.body.answer,
        dataset: req.body.dataset,
        status: req.body.status === "pending" ? req.body.status : "sleeping",
        comment: req.body.comment
    };

    try {
        const test = await Test.create(testData);

        if (testData.status === "pending") {
            await testRunQueue.add("process-test", test._id);
        }

        return res
            .status(201)
            .json(test);
    } catch (error) {
        res
            .status(400)
            .json(error);
    }
}

const testsReadOne = async (req, res) => {
    try {
        const test = await Test.findById(req.params.testId).exec();

        if (!test) {
            // return error(404, "test not found");
            throw Error("test not found");
        }

        return res
            .status(200)
            .json(test);
    } catch (error) {
        res
            .status(400)
            .json(error);
    }
}

const testsUpdateOne = async (req, res) => {
    const testData = {
        name: req.body.name,
        collection: req.body.collection,
        instructions_prompt: req.body.instructions_prompt,
        model: req.body.model,
        visualization: req.body.visualization,
        question_item: req.body.question_item,
        task: req.body.task,
        question: req.body.question,
        answer: req.body.answer,
        dataset: req.body.dataset,
        status: req.body.status,
        comment: req.body.comment,
        log: req.body.log,
        messages: req.body.messages
    };

    try {
        const test = await Test.findOneAndUpdate(
            { _id: req.params.testId },
            testData,
            { new: true }
        ).exec();

        if (!test) {
            // return error(404, "test not found");
            throw Error("test not found");
        }

        if (testData.status === "pending") {
            await testRunQueue.add("process-test", test._id);
        }

        return res
            .status(201)
            .json(test);
    } catch (error) {
        res
            .status(400)
            .json(error);
    }
}

const testsDeleteOne = async (req, res) => {
    try {
        const test = await Test
            .findByIdAndDelete(req.params.testId)
            .exec();

        if (!test) {
            // return error(404, "test not found");
            throw Error("test not found");
        }

        return res
            .status(204)
            .json(null);
    } catch (error) {
        res
            .status(400)
            .json(error);
    }
}

module.exports = {
    testsMetaInformation,
    testsReadAll,
    testsCreateOne,
    testsReadOne,
    testsUpdateOne,
    testsDeleteOne
};
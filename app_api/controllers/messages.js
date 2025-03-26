const mongoose = require('mongoose');
const Dialog = mongoose.model('Dialog')
const LLM = mongoose.model('LLM');
const Message = mongoose.model('Message')
const { client: OpenAIclient } = require('../util/openai')
const { error, handleError } = require('../util/error');

const nliRegex = /```json\s*({[\s\S]*?})\s*```/;

function convertOpenAiMessageContent(text) {
    // extracts structured nli from message if present
    // { "content": "I created a visual mapping", "nli": { "highlight": ["id1", "id2"] } }
    const internalMessage = {
        content: text,
        type: "text",
        from: "system",
        nli: null
    };

    const match = text.match(nliRegex);
    if (match) {
        try {
            internalMessage.content = text.replace(nliRegex, "").trim();
            internalMessage.nli = JSON.parse(match[1]);
        } catch (err) {
            // TODO
            console.log(err);
        }

    }

    return internalMessage;
}

function parseOpenAiMessagesToInternalMessages(messages, stop) {
    /**
     * Converts OpenAI messages into internal format.
     * Stops when the message `stop` is encountered.
     * Merges nli only messages with the previous message.
     */
    const openAiMessages = messages.data;
    const internalMessages = [];

    for (const openAiMessage of openAiMessages) {
        const openAiMessageText = openAiMessage.content.find(content => content.type === "text").text.value;

        if (openAiMessageText === stop) {
            break;
        }

        const parsedMessage = convertOpenAiMessageContent(openAiMessageText);
        parsedMessage.id = openAiMessage.id
        internalMessages.push(parsedMessage);
    }

    const mergedInternalMessages = internalMessages.reverse().reduce((acc, message) => {
        if (message.content === "" && acc.length > 0) {
            const previousMessage = acc[acc.length - 1];
            if (previousMessage.nli) {
                console.log("WARNING nli overwritten")
            }
            acc[acc.length - 1] = { ...previousMessage, nli: message.nli };
        } else {
            acc.push({ ...message });
        }
        return acc;
    }, []);

    return mergedInternalMessages;
}

function parseOpenAiToolcallToInternalMessages(runSteps) {
    const steps = runSteps.data;
    const internalMessages = [];

    for (const step of steps) {
        if (step.type !== "tool_calls") {
            continue
        }
        for (const toolcall of step.step_details.tool_calls) {
            if (toolcall.type !== "code_interpreter") {
                continue
            }
            const codeInput = toolcall.code_interpreter.input;
            const codeOutputs = toolcall.code_interpreter.outputs;

            internalMessages.push({
                id: toolcall.id,
                content: codeInput,
                type: "code",
                from: "system"
            })
        }
    }

    return internalMessages
}

function mergeAndSort(runSteps, textMessages, codeMessages) {
    const stepsTimeSorted = runSteps.data.reverse().sort((a, b) => a.completed_at - b.completed_at);

    const sortedIds = [];
    for (const step of stepsTimeSorted) {
        if (step.type === "message_creation") {
            sortedIds.push(step.step_details.message_creation.message_id)
        }
        if (step.type === "tool_calls") {
            for (const toolcall of step.step_details.tool_calls) {
                sortedIds.push(toolcall.id)
            }
        }
    }

    const merged = [...textMessages, ...codeMessages].reduce((map, obj) => {
        map[obj.id] = obj;
        return map;
    }, {});

    return sortedIds.map(id => merged[id]).filter(Boolean).map(({ id, ...rest }) => rest);

}

const messageCreateOne = async (req, res) => {
    try {
        const [dialog, llm] = await Promise.all([
            Dialog.findById(req.params.dialogId).exec(),
            LLM.findById(req.params.llmId).exec(),
        ]);

        if (!dialog || !llm) {
            // return error(404, "Dialog or LLM not found");
            throw Error("Dialog or LLM not found");
        }

        await OpenAIclient.beta.threads.messages.create(
            dialog.vendorId,
            {
                role: "user",
                content: req.body.content,
            });

        const run = await OpenAIclient.beta.threads.runs.createAndPoll(dialog.vendorId, { assistant_id: llm.vendorId });
        const runSteps = await OpenAIclient.beta.threads.runs.steps.list(
            run.thread_id,
            run.id
        );
        const openAiMessages = await OpenAIclient.beta.threads.messages.list(dialog.vendorId);

        const parsedCodeMessages = parseOpenAiToolcallToInternalMessages(runSteps)
        const parsedTextMessages = parseOpenAiMessagesToInternalMessages(openAiMessages, req.body.content);

        const sortedMessages = mergeAndSort(runSteps, parsedTextMessages, parsedCodeMessages);

        return res
            .status(200)
            .json(sortedMessages);
    } catch (err) {
        console.log(err)
        handleError(err, res);
    }
}

const messageReadOne = async (req, res) => {
    try {
        const dialog = await Dialog.findById(req.params.dialogId).exec();
        const threadMessages = await OpenAIclient.beta.threads.messages.list(dialog.vendorId);

        var responseMessages = [];
        for (const threadMessage of threadMessages.data.reverse()) {
            if (threadMessage.role === "user") {
                for (const userMsg of threadMessage.content) {
                    responseMessages.push({
                        content: userMsg.text.value,
                        type: "text",
                        from: "user"
                    })
                }
            } else {
                const runSteps = await OpenAIclient.beta.threads.runs.steps.list(
                    dialog.vendorId,
                    threadMessage.run_id
                );
                const parsedCodeMessages = parseOpenAiToolcallToInternalMessages(runSteps);
                const parsedTextMessages = parseOpenAiMessagesToInternalMessages({ data: [threadMessage] }, undefined);
                const sortedMessages = mergeAndSort(runSteps, parsedTextMessages, parsedCodeMessages);

                responseMessages = responseMessages.concat(sortedMessages);
            }
        }
        return res
            .status(200)
            .json(responseMessages);
    } catch (err) {
        console.log(err)
        handleError(err, res);
    }
}

module.exports = {
    messageCreateOne,
    messageReadOne
}
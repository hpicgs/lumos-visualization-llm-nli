const mongoose = require('mongoose');
const { client: OpenAIclient } = require('../util/openai')
const { error, handleError } = require('../util/error');

const nliRegex = /```json\s*({[\s\S]*?})\s*```/;

function convertOpenAiMessageContent(text) {
    // extracts structured nli from message if present
    // { "content": "I created a visual mapping", "nli": { "highlight": ["id1", "id2"] } }
    const internalMessage = {
        content: text,
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
    const openAiMessages = messages.choices;
    const internalMessages = [];

    for (const openAiMessage of openAiMessages) {
        const openAiMessageText = openAiMessage.message.content;

        if (openAiMessageText === stop) {
            break;
        }

        const parsedMessage = convertOpenAiMessageContent(openAiMessageText);
        internalMessages.push(parsedMessage);
    }

    const mergedInternalMessages = internalMessages.reverse().reduce((acc, message) => {
        if (message.content === "") {
            if (acc.length > 0) {
                const previousMessage = acc[acc.length - 1];
                if (previousMessage.nli) {
                    console.log("WARNING nli overwritten")
                }
                acc[acc.length - 1] = { ...previousMessage, nli: message.nli };
            }
        } else {
            acc.push({ ...message });
        }
        return acc;
    }, []);

    return mergedInternalMessages;
}

const chatCreateOne = async (req, res) => {
    try {
        const completion = await OpenAIclient.chat.completions.create({
            model: req.body.model,
            messages: [
                {
                    role: "user",
                    content: req.body.content
                }
            ]
        });
        const parsedMessages = parseOpenAiMessagesToInternalMessages(completion, null);

        return res
            .status(200)
            .json(parsedMessages)
    } catch (error) {
        console.log(error)
        handleError(error, res)
    }
}

module.exports = {
    chatCreateOne
}
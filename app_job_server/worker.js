const testRunQueue = require('./util/queue')

const _fetch = async (url, method, body) => {
    const init = {
        method: method,
        headers: {
            "Content-Type": "application/json",
        }
    }
    if (body) init["body"] = JSON.stringify(body)

    return await fetch(
        url,
        init);
}
const _POST = async (url, body) => await _fetch(url, "POST", body)
const _GET = async (url, body) => await _fetch(url, "GET", body)
const _PUT = async (url, body) => await _fetch(url, "PUT", body)
const _DELETE = async (url) => await _fetch(url, "DELETE", undefined)


testRunQueue.process('process-test', async (job) => {
    console.log(`Processing test ${job.data}. Job id ${job.id}`);

    const testId = job.data;

    var test;
    var file;
    var prompt;
    var llm;
    var dialog;
    var messages;

    var testStatus;
    var testLog;

    try {
        // Update test to running status and fetch it
        const testResponse = await _PUT(`http://express:3000/api/tests/${testId}`, { status: "running" });

        if (!testResponse.ok) {
            console.log(testResponse.statusText);
            throw Error(`Error with test: ${testResponse.statusText}`)
        }

        test = await testResponse.json();

        // Load or upload file
        const fileResponse = await _GET(`http://express:3000/api/files?name=${test.dataset}`)

        if (!fileResponse.ok) {
            console.log(fileResponse.statusText);
            throw Error(`Error with files: ${fileResponse.statusText}`)
        }
        const files = await fileResponse.json();
        if (!files) {
            throw Error("file not found. files must be uploaded before running tests")
        } else {
            file = files[0];
        }

        if (!test.model.startsWith("o1")) {
            // Create prompt
            const promptResponse = await _POST("http://express:3000/api/prompts",
                {
                    name: `TEST ${test._id}`,
                    content: test.instructions_prompt,
                    type: "prompt"
                });

            if (!promptResponse.ok) {
                console.log(promptResponse.statusText);
                throw Error(`Error with prompt: ${promptResponse.statusText}`)
            }

            prompt = await promptResponse.json();

            // Create assistant
            const llmResponse = await _POST("http://express:3000/api/llms",
                {
                    name: `TEST ${test._id}`,
                    description: "temporary llm instance for test",
                    provider: "OpenAi",
                    model: test.model,
                    prompt: prompt._id
                });

            if (!llmResponse.ok) {
                console.log(llmResponse.statusText);
                throw Error(`Error with llm: ${llmResponse.statusText}`)
            }

            llm = await llmResponse.json();

            // Create dialog
            const dialogResponse = await _POST(`http://express:3000/api/llms/${llm._id}/dialogues`,
                {
                    name: `TEST ${test._id}`,
                    file: file._id
                });

            if (!dialogResponse.ok) {
                console.log(dialogResponse.statusText);
                throw Error(`Error with llm dialog: ${dialogResponse.statusText}`)
            }

            dialog = await dialogResponse.json();

            // Create message
            const messageResponse = await _POST(`http://express:3000/api/llms/${llm._id}/dialogues/${dialog._id}/messages`,
                {
                    content: test.question
                });

            if (!messageResponse.ok) {
                console.log(messageResponse.statusText);
                throw Error(`Error with llm messages: ${messageResponse.statusText}`)
            }
            messages = [{ from: "user", content: test.question }];
            (await messageResponse.json()).map((msg) => {
                messages.push({ from: "system", ...msg })
            });
        } else {
            // o1 models are not available in assistants, so every info has to go into the question to the regular chat completions api
            const fileResponse = await fetch(`http://express:3000/api/files/${file._id}`)
            const csvData = await fileResponse.text()
            const prompt = test.instructions_prompt + "\n\nQestion: " + test.question + "\n\nData:\n" + csvData;

            const messageResponse = await _POST("http://express:3000/api/chats",
                {
                    model: test.model,
                    content: prompt
                }
            )
            messages = [{ from: "user", content: prompt }];
            (await messageResponse.json()).map((msg) => {
                messages.push({ from: "system", ...msg })
            });
        }

        // check answer
        for (const message of messages.slice(1)) {
            // only check textual answers
            if (message.type && message.type === "code") {
                continue
            }
            if (message.content.toLowerCase().includes(test.answer.toLowerCase())) {
                testStatus = "passed";
            }
        }

        if (testStatus === undefined) {
            testLog = "Answer not matched in message response";
        }
    } catch (error) {
        testStatus = "failed";
        testLog = error;
    } finally {
        // delete llm
        if (llm) await _DELETE(`http://express:3000/api/llms/${llm._id}`)

        // delete prompt
        if (prompt) await _DELETE(`http://express:3000/api/prompts/${prompt._id}`);

        // update test
        testStatus = testStatus ? testStatus : "failed";
        await _PUT(`http://express:3000/api/tests/${testId}`,
            {
                status: testStatus,
                messages: messages,
                log: String(testLog)
            });
    }

    console.log(`Job ${job.id} processed | Status ${testStatus}`);
});
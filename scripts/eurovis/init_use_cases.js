const fsPromise = require("fs").promises;
const path = require("path")

const llmInfos = [
    {
        name: "Eurovis Candlestick Chart",
        description: "Eurovis use case",
        model: "gpt-4o",
        prompt: "CandlestickChart_Prompt",
        dataset: "Volkswagen_Candlestick.csv"
    }
]
const prompts = {}


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


const readPrompts = async (folder) => {
    const filenames = await fsPromise.readdir(folder);
    const filepaths = filenames.map(filename => [
        path.join(folder, filename).toString(),
        path.parse(filename).name
    ])

    for (const [file, filename] of filepaths) {
        const prompt = await fsPromise.readFile(file, "utf-8")

        prompts[filename] = prompt;
    }
}

(async () => {
    try {
        await readPrompts("./eurovis/prompts");

        for (const info of llmInfos) {
            // Load or upload file
            var file;
            const fileResponse = await _GET(`http://localhost:3000/api/files?name=${info.dataset}`)

            if (!fileResponse.ok) {
                console.log(fileResponse.statusText);
                throw Error(`Error with files: ${fileResponse.statusText}`)
            }
            const files = await fileResponse.json();
            if (!files) {
                throw Error("file not found. files must be uploaded before creating llm dialogues")
            } else {
                file = files[0];
            }

            // Create prompt
            const promptResponse = await _POST("http://localhost:3000/api/prompts",
                {
                    name: info.prompt,
                    content: prompts[info.prompt],
                    type: "prompt"
                });

            if (!promptResponse.ok) {
                console.log(promptResponse.statusText);
                throw Error(`Error with prompt: ${promptResponse.statusText}`)
            }

            const prompt = await promptResponse.json();

            // Create assistant
            const llmResponse = await _POST("http://localhost:3000/api/llms",
                {
                    name: info.name,
                    description: info.description,
                    provider: "OpenAi",
                    model: info.model,
                    prompt: prompt._id
                });

            if (!llmResponse.ok) {
                console.log(llmResponse.statusText);
                throw Error(`Error with llm: ${llmResponse.statusText}`)
            }

            const llm = await llmResponse.json();

            // Create dialog with dataset
            const dialogResponse = await _POST(`http://localhost:3000/api/llms/${llm._id}/dialogues`,
                {
                    name: `eurovis use case with dataset ${info.dataset}`,
                    file: file._id
                });

            if (!dialogResponse.ok) {
                console.log(dialogResponse.statusText);
                throw Error(`Error with llm dialog: ${dialogResponse.statusText}`)
            }

            dialog = await dialogResponse.json();
        }
    } catch (error) {
        console.error('Error:', error);
    }
})();
const fsPromise = require("fs").promises;
const fs = require("fs")
const papa = require("papaparse")
const path = require("path")

const prompts = {}
const questions = {}

const readPrompts = async (folder) => {
    const filenames = await fsPromise.readdir(folder);
    const filepaths = filenames.map(filename => [
        path.join(folder, filename).toString(),
        path.parse(filename).base
    ])

    for (const [file, filename] of filepaths) {
        const prompt = await fsPromise.readFile(file, "utf-8")

        prompts[filename] = prompt;
    }
}

const readQuestions = async (folder) => {
    async function readQuestionCsv(filename) {
        const file = fs.createReadStream(filename);

        return new Promise((resolve) => {
            papa.parse(file, {
                header: true,
                complete: results => {
                    resolve(results.data);
                }
            })
        });
    }

    const filenames = await fsPromise.readdir(folder);
    const filepaths = filenames.map(filename => [
        path.join(folder, filename).toString(),
        path.parse(filename).name
    ])

    for (const [file, filename] of filepaths) {
        const csv = await readQuestionCsv(file)

        questions[filename] = csv;
    }
}

const uploadTests = async () => {
    async function postTest(test) {
        await fetch("http://localhost:3000/api/tests", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(test)
        })
    }

    for (const [chartType, csv] of Object.entries(questions)) {
        for (const testData of csv) {
            const testName = `${testData.Visualization} test item ${testData.Question_item} ${testData.Model} prompt v${testData["Instruction Prompt_Item"]}`
            const test = {
                name: testName,
                collection: "eurovis",
                instructions_prompt: prompts[testData["Instruction Prompt"]],
                model: testData.Model,
                visualization: testData.Visualization,
                question_item: testData.Question_item,
                task: testData.Task,
                question: testData.Question,
                answer: testData.Question_Answer,
                dataset: testData.Dataset,
            }
            await postTest(test)
        }
        console.log(`imported ${csv.length} ${chartType} tests`)
    }
}



(async () => {
    try {
        await readPrompts("./eurovis/prompts");
        await readQuestions("./eurovis/questions");
        await uploadTests();
    } catch (error) {
        console.error('Error:', error);
    }
})();

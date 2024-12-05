const fsPromise = require("fs").promises;
const fs = require("fs")
const path = require("path")
const FormData = require("form-data")

const uploadDatasets = async (folder) => {
    async function submitFile(file) {
        const form = new FormData();
        form.append("description", "Dataset for eurovis benchmark");
        form.append("dataFile", fs.createReadStream(file));

        return new Promise((resolve) => {
            form.submit("http://localhost:3000/api/files", (err, res) => {
                resolve(res);
            })
        });
    }

    const filenames = await fsPromise.readdir(folder);
    const filepaths = filenames.map(filename => [
        path.join(folder, filename).toString(),
        path.parse(filename).name
    ])

    for (const [file, filename] of filepaths) {
        await submitFile(file)
    }
}



(async () => {
    try {
        await uploadDatasets("./eurovis/datasets");
    } catch (error) {
        console.error('Error:', error);
    }
})();

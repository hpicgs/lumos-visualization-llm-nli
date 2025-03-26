const fs = require("fs");
const path = require("path");

const testResultDir = "./vis/test_results";

if (!fs.existsSync(testResultDir)) {
    fs.mkdirSync(testResultDir);
}

function addMessageLenghts(tests) {
    const modifiedTests = [];

    function add(accumulator, a) {
        return accumulator + a;
    }

    for (const test of tests) {
        var nChars = [];
        for (let index = 0; index < test.messages.length; index++) {
            const message = test.messages[index];
            if (index === 0) {
                continue
            }
            if (message.type && message.type === "code") {
                continue
            }
            nChars.push(Array.from(message.content).length)
        }

        test["number_of_response_messages"] = nChars.length;
        test["average_message_length"] = nChars.reduce(add, 0) / nChars.length;

        modifiedTests.push(test)
    }

    return modifiedTests
}

(async () => {
    const testResponse = await fetch("http://localhost:3000/api/tests?" + new URLSearchParams({
        collection: "vis experiment 1"
    }))
    var tests = await testResponse.json()

    tests = addMessageLenghts(tests);

    var file = fs.createWriteStream(path.join(testResultDir, "vis_test_results.json"));
    file.write(JSON.stringify(tests, null, 2));
    file.end();

    console.log(`Exported ${tests.length} tests`)
})()
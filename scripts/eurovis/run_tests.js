(async () => {
    const testResponse = await fetch("http://localhost:3000/api/tests?collection=eurovis")
    const tests = await testResponse.json()

    for (const test of tests) {
        await fetch(`http://localhost:3000/api/tests/${test._id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: "pending" })
            }
        )
    }

    console.log(`Started ${tests.length} tests`)
})()
import { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react'
import Chat from "./Chat";
import Table from "./Table";

const SelectableButtonGroup = ({ title = "", options = [], onChange }) => {
    const [selected, setSelected] = useState(options[0]);

    const handleSelection = (option) => {
        setSelected(option);
        if (onChange) onChange(option);
    };

    return (
        <div className="my-auto mx-auto">
            <h1 className="text-lg font-medium mb-4 text-gray-800">{title}</h1>
            <div className="inline-flex rounded-md shadow-sm" role="group">
                {options.map((option, index) => {
                    const selectedStyle = "z-10 ring-2 ring-blue-700 text-blue-700"
                    return <button
                        key={index}
                        type="button"
                        className={`${selected === option ? selectedStyle : ""} rounded-none px-4 py-2 text-sm font-medium text-gray-900 bg-white border-gray-300 hover:text-blue-700`}
                        onClick={() => handleSelection(option)}>
                        {option}
                    </button>
                })}
            </div>
        </div>
    );
};

const StatusBadge = ({ value, row }) => {
    const [isDropdownOpen, setDropdownOpen] = useState(false);

    const statusColors = {
        passed: "bg-green-100 text-green-950 border-2 border-green-200",
        failed: "bg-red-100 text-red-950 border-2 border-red-200",
        pending: "bg-sky-100 text-sky-950 border-2 border-sky-200",
        running: "bg-amber-100 text-amber-950 border-2 border-amber-200",
        sleeping: "bg-zinc-100 text-zinc-950 border-2 border-zinc-200"
    };
    const color = statusColors[value] || "bg-zinc-100 text-zinc-950 border-2 border-zinc-200";
    const hoverText = value === "failed" ? `${row.log}` : null;

    const handleStatusClick = async (option) => {
        setDropdownOpen(false);

        await fetch(`http://localhost:3000/api/tests/${row._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: option })
        })
    };

    return (
        <div className="relative group">
            {/* badge */}
            <span
                className={`px-2 py-1 text-sm font-semibold rounded ${color} cursor-pointer`}
                onClick={() => setDropdownOpen((prev) => !prev)}>
                {value}
            </span>

            {/* On hover text for failed tests */}
            {hoverText && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-max px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:block group-hover:opacity-100 transition-opacity">
                    {hoverText}
                </div>
            )}

            {/* Override status */}
            {isDropdownOpen && (
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded shadow-lg w-40">
                    <button
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleStatusClick("failed")}
                    >
                        Failed
                    </button>
                    <button
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleStatusClick("passed")}
                    >
                        Passed
                    </button>
                </div>
            )}
        </div>
    );
}

const CommentField = ({ value, row }) => {
    const [isChanged, setIsChanged] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        const response = await fetch(`http://localhost:3000/api/tests/${row._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ comment: event.target.testComment.value })
        })
        if (response.ok) {
            setIsChanged(false)
        }
    }

    return (
        <div>
            <form autoComplete="off" onSubmit={handleSubmit} className="flex">
                <input
                    type="text"
                    name="testComment"
                    autoComplete="off"
                    className="flex-grow border rounded-l-lg outline-none disabled:bg-gray-100"
                    defaultValue={value}
                    onChange={(e) => setIsChanged(value ? e.target.value !== value : true)} />
                <button
                    type="submit"
                    disabled={!isChanged}
                    className="bg-zinc-500 text-white border rounded-none rounded-r-lg disabled:hover:border-zinc-200 hover:bg-zinc-600 disabled:bg-zinc-200">Update</button>
            </form>
        </div>
    );
}

const RunTestIcon = ({ value, row, onClick }) => {
    return (
        <div className="relative group">
            {/* icon */}
            <div className="pl-6 cursor-pointer" onClick={() => onClick(row._id)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                </svg>
            </div>

            {/* hover text */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-max px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:block group-hover:opacity-100 transition-opacity">
                Run Test
            </div>
        </div>
    );
}

const ShowChatHistory = ({ value, row }) => {
    const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false)
    const messages = ["pending", "running"].includes(row.status) ? [] : row.messages;

    return (
        <>
            <div className="relative group">
                {/* icon */}
                <div className="pl-2 cursor-pointer" onClick={() => setIsChatHistoryOpen(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                </div>

                {/* hover text */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden w-max px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:block group-hover:opacity-100 transition-opacity">
                    Show Chat History
                </div>
            </div>

            <Dialog
                open={isChatHistoryOpen}
                onClose={() => setIsChatHistoryOpen(false)}
                className="relative z-10 focus:outline-none">
                <DialogBackdrop className="fixed inset-0 bg-black/30" />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            className="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-3xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0">
                            <Chat messages={messages} llms={[]} />
                        </DialogPanel>
                    </div>
                </div>

            </Dialog>
        </>
    );
}

export default function TestView() {
    const [urlParameterOptions, setUrlParameterOptions] = useState({});
    const [urlParameters, setUrlParameters] = useState({});
    const [tests, setTests] = useState([]);

    const columns = [
        { header: "Name", accessor: "name" },
        { header: "Model", accessor: "model" },
        { header: "Question Item", accessor: "question_item" },
        { header: "Task", accessor: "task" },
        { header: "Question", accessor: "question" },
        { header: "Answer", accessor: "answer" },
        { header: "Dataset", accessor: "dataset" },
        { header: "Status", accessor: "status" },
        { header: "Comment", accessor: "comment" },
        { header: "", accessor: "_run" },
        { header: "", accessor: "_chat" }
    ];
    const renderers = {
        status: StatusBadge,
        comment: CommentField,
        _run: (props) => <RunTestIcon {...props} onClick={RunTest} />,
        _chat: (props) => <ShowChatHistory {...props} />
    };

    // Effect to load parameter options
    useEffect(() => {
        async function fetchOptions() {
            const response = await fetch("http://localhost:3000/api/tests/meta");
            if (!response.ok) {
                console.error(`error: ${response.statusText}`);
                return;
            }
            const options = await response.json()
            setUrlParameterOptions(options);
            setUrlParameters(Object.fromEntries(
                Object.entries(options).map(([key, value]) => [key, value[0]])
            ));
        }
        fetchOptions();
        return;
    }, []);

    // effect to re-trigger test fetch if url parameters changed
    useEffect(() => {
        async function fetchTests() {
            if (Object.keys(urlParameters).length === 0) {
                return
            }
            const url = `http://localhost:3000/api/tests?${new URLSearchParams(urlParameters).toString()}`;
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`error: ${response.statusText}`);
                return;
            }
            setTests(await response.json());
        }
        fetchTests();
        return;
    }, [urlParameters]);

    async function RunTest(testId) {
        const test = tests.find((test) => test._id === testId)
        if (!test || ["pending", "running"].includes(test.status)) {
            return
        }

        await fetch(`http://localhost:3000/api/tests/${testId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "pending" })
        })

        setTests(prev =>
            prev.map(test =>
                test._id === testId ? { ...test, status: "pending" } : test
            )
        );
    }

    return (
        <>
            <div className="flex flex-col w-full p-5 ml-5">
                <div className="space-y-2">
                    {
                        Object.entries(urlParameterOptions).map(([param, values]) => {
                            return <SelectableButtonGroup
                                key={param}
                                title={param.charAt(0).toUpperCase() + param.slice(1)}
                                options={values}
                                onChange={(option) => setUrlParameters((prev) => {
                                    const newParams = { ...prev };
                                    newParams[param] = option;
                                    return newParams
                                })} />
                        })
                    }
                </div>

                <div className="pt-5">
                    <Table data={tests} columns={columns} renderers={renderers} />
                </div>
            </div>
        </>
    );
}
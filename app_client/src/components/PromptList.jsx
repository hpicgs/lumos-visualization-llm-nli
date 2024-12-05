import { useEffect, useState } from "react";
import PromptCreateDialog from "./PromptCreateDialog";

function Prompt(props) {
    const [isExpanded, setIsExpanded] = useState(false);

    function toggleExpanded() {
        setIsExpanded((prev) => {
            return !prev;
        })
    }

    return (
        <li className="flex justify-between gap-x-6 py-5">
            <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto text-left">
                    <p className="text-m font-semibold leading-6 text-gray-900">{props.prompt.name}</p>
                    <p
                        id={"content-" + props.prompt._id}
                        className={`mt-1 text-sm leading-5 text-gray-500 cursor-pointer ${isExpanded ? "" : "line-clamp-[9]"}`}
                        style={{ whiteSpace: "pre-line" }}
                        onClick={() => toggleExpanded()}
                    >{props.prompt.content}</p>
                </div>
            </div>
            <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                <span className={"inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset " + (props.prompt.type === "prompt" ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-blue-50 text-blue-700 ring-blue-700/10")}>
                    {props.prompt.type}
                </span>
            </div>
        </li>
    );
}

export default function PromptList() {
    const [prompts, setPrompts] = useState([]);
    const [isPromptCreationOpen, setIsPromptCreationOpen] = useState(false)

    useEffect(() => {
        async function fetchPrompts() {
            const response = await fetch(
                "http://localhost:3000/api/prompts"
            );
            if (!response.ok) {
                const message = `An error has occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const prompts = await response.json();
            setPrompts(prompts)
        }
        fetchPrompts();
        return;
    }, [prompts.length]);

    return (
        <>
            <div className="flex flex-col p-5 ml-5">
                <div>
                    <button
                        className="rounded-none bg-orange-100"
                        onClick={() => setIsPromptCreationOpen(true)}
                    >Add Prompt</button>
                </div>

                {prompts.length ? (
                    <ul role="list" className="divide-y divide-gray-100">
                        {prompts.map((prompt) => <Prompt key={prompt._id} prompt={prompt} />
                        )}
                    </ul>
                ) : (
                    <div className="items-center">
                        <h1>Nothing here!</h1>
                        <p className="mt-2">
                            <i>No Prompts have been Created yet</i>
                        </p>
                    </div>
                )}
            </div>
            <PromptCreateDialog
                open={isPromptCreationOpen}
                onClose={(savedPrompt) => {
                    setIsPromptCreationOpen(false);
                    setPrompts((prev) => [...prev, savedPrompt])
                }} />

        </>
    );
}
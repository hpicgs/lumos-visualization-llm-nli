import { useEffect, useState } from "react";
import LlmCreateDialog from "./LLMCreateDialog";

function Llm({ llm }) {
    return (
        <li className="flex justify-between gap-x-6 py-5">
            <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto text-left">
                    <p className="text-m font-semibold leading-6 text-gray-900">{llm.name}</p>
                    <p className="mt-1 text-sm leading-5 text-gray-500">{llm.description}</p>
                </div>
            </div>
            <div className="hidden flex-none shrink-0 sm:flex sm:flex-col sm:items-end">
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                >{llm.provider}</span>
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20"
                >{llm.model}</span>
            </div>
        </li>
    );
}

export default function LlmList() {
    const [llms, setLlms] = useState([]);
    const [isLlmCreationOpen, setIsLlmCreationOpen] = useState(false)

    useEffect(() => {
        async function fetchLlms() {
            const response = await fetch(
                "http://localhost:3000/api/llms"
            );
            if (!response.ok) {
                const message = `An error has occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const llms = await response.json();
            setLlms(llms)
        }
        fetchLlms();
        return;
    }, [llms.length]);

    return (
        <>
            <div>
                <button
                    className="rounded-none bg-orange-100"
                    onClick={() => setIsLlmCreationOpen(true)}
                >Add Llm</button>
            </div>

            {llms.length ? (
                <ul role="list" className="divide-y divide-gray-100">
                    {llms.map((llm) => <Llm key={llm._id} llm={llm} />
                    )}
                </ul>
            ) : (
                <div className="items-center">
                    <h1>Nothing here!</h1>
                    <p className="mt-2">
                        <i>No Llms have been Created yet</i>
                    </p>
                </div>
            )}

            <LlmCreateDialog
                open={isLlmCreationOpen}
                onClose={(savedLlm) => {
                    setIsLlmCreationOpen(false);
                    setLlms((prev) => [...prev, savedLlm])
                }} />
        </>
    );
}
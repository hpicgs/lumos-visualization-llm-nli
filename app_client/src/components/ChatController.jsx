import { ExpandableModelSelection, MessageList } from "./Chat"
import { useState, useEffect } from "react"

let nextMessageId = 0;

export default function ChatController({ defaultLLM, onChangeNli }) {
    // Message format:
    // 
    // const messages = [
    //     { _id: "1", from: "user", content: "Can you create a config?" },
    //     { _id: "2", from: "assistant", type: "", content: "yes", nli: { mapping: { height: "nof", colors: "dc" } } },
    //     { _id: "3", from: "assistant", type: "code", content: "import pandas as pd" }
    // ]
    const [llms, setLlms] = useState([]);
    const [dialogues, setDialogues] = useState([]);
    const [activeLlm, setActiveLlm] = useState();
    const [activeDialog, setActiveDialog] = useState();
    const [isAssistantBusy, setIsAssistantBusy] = useState(true);
    const [messages, setMessages] = useState([]);



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
            setLlms(llms);

            if (llms.length) {
                var llmIndex = 0;
                if (defaultLLM) {
                    const index = llms.findIndex(llm => llm.name === defaultLLM);
                    llmIndex = index !== -1 ? index : 0
                }
                setActiveLlm(llms[llmIndex])
                fetchDialogues(llms[llmIndex]._id);
            }
        }
        fetchLlms();
        return;
    }, []);

    async function fetchDialogues(llmId) {
        fetch(`http://localhost:3000/api/llms/${llmId}/dialogues`)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response.statusText);
                }
                return response.json();
            })
            .then((dialogues) => {
                setDialogues(dialogues);
                setActiveDialog(dialogues[0]);
                fetchDialogMessages(llmId, dialogues[0]._id)
            })
            .catch((err) => console.log(err));
    }

    async function fetchDialogMessages(llmId, dialogId) {
        fetch(`http://localhost:3000/api/llms/${llmId}/dialogues/${dialogId}/messages`)
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response.statusText);
                }
                return response.json();
            })
            .then((messages) => {
                setMessages(messages);
                setIsAssistantBusy(false);
            })
            .catch((err) => console.log(err));
    }

    function onCreateDialog() {
        fetch(`http://localhost:3000/api/llms/${activeLlm._id}/dialogues`, {
            method: "POST",
        })
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response.statusText);
                }
                return response.json();
            })
            .then((dialog) => {
                setDialogues((prev) => [...prev, dialog])
                setActiveDialog(dialog)
            })
            .catch((err) => console.log(err));
    }

    function onChangeDialog(dialogId) {
        const dialog = dialogues.find(dialog => dialog._id === dialogId);
        setActiveDialog(dialog);
    }

    function onChangeLlm(llmId) {
        const llm = llms.find(llm => llm._id === llmId);
        setActiveLlm(llm);

        fetchDialogues(llmId)
    }

    function onNewMessages(messages) {
        const _messages = [];
        messages.forEach(message => {
            _messages.push({ ...message, from: "system", _id: nextMessageId++ })
            if (message.nli) {
                onChangeNli(message.nli);
            }
        });
        setMessages((prev) => [...prev, ..._messages])
    }

    function onSendMessage(event) {
        event.preventDefault();
        const message = event.target.elements.userMessage.value;
        event.target.elements.userMessage.value = "";

        setIsAssistantBusy(true);
        setMessages((prev) => [...prev, {
            _id: nextMessageId++, from: "user", content: message
        }])

        fetch(`http://localhost:3000/api/llms/${activeLlm._id}/dialogues/${activeDialog._id}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: message }),
        })
            .then((response) => {
                if (!response.ok) {
                    return Promise.reject(response.statusText);
                }
                return response.json();
            })
            .then((messages) => {
                onNewMessages(messages);
                setIsAssistantBusy(false);
            })
            .catch((err) => console.log(err));
    }
    return (
        <div className="flex flex-col h-screen pb-2 bg-indigo-50/50">
            <ExpandableModelSelection
                llms={llms}
                dialogues={dialogues}
                {...(activeLlm && { defaultLlm: activeLlm._id })}
                onChangeLlm={onChangeLlm}
                onChangeDialog={onChangeDialog}
                onCreateDialog={onCreateDialog} />

            <MessageList
                messages={messages}
                isAssistantBusy={isAssistantBusy} />

            <div className="mt-2 px-3">
                <form autoComplete="off" onSubmit={onSendMessage} className="flex">
                    <input
                        type="text"
                        name="userMessage"
                        autoComplete="off"
                        disabled={isAssistantBusy || !llms.length || !dialogues.length}
                        className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring focus:ring-indigo-300 disabled:bg-gray-100"
                        placeholder={isAssistantBusy ? "..." : "Type a message..."}
                    />
                    <button
                        type="submit"
                        disabled={isAssistantBusy || !llms.length || !dialogues.length}
                        className="p-2 bg-indigo-500 text-white border rounded-none rounded-r-lg hover:bg-indigo-600 disabled:bg-indigo-200">Send</button>
                </form>
            </div>
        </div>
    )
}
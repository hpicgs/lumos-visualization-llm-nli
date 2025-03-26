import { createRef, useEffect, useState } from 'react';
import Markdown from 'react-markdown'
import remarkBreaks from "remark-breaks";
import SyntaxHighlighter from 'react-syntax-highlighter';

function LoadingMessage() {
    const key = Number.MAX_SAFE_INTEGER

    return (
        <li key={key} className="flex justify-start">
            <div>
                <div className="pb-2 text-sm text-slate-500">assistant</div>
                <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
                    role="status">
                    <span
                        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
            </div>
        </li >
    )
}

function Message(msg, isFirst) {
    const messageOrientation = msg.from === "user" ?
        "justify-end" : "justify-start";
    const messageStyle = msg.from === "user" ?
        "bg-white rounded-b-xl rounded-tl-xl" : "bg-sky-500 text-white rounded-xl";

    return (
        <li key={msg._id} className={`flex ${messageOrientation}`}>
            <div className="flex flex-col">
                {isFirst && (
                    <div className={`pb-2 text-sm text-slate-500 flex ${messageOrientation}`}>
                        {msg.from}
                    </div>
                )}
                {msg.type === "code" ? (
                    <SyntaxHighlighter className="p-2 rounded-xl" language="python" showLineNumbers>
                        {msg.content}
                    </SyntaxHighlighter>
                ) : (
                    <div className={`p-2 text-base ${messageStyle}`}>
                        <Markdown remarkPlugins={[remarkBreaks]}>{msg.content}</Markdown>
                    </div>
                )}
            </div>
        </li>
    );
}

export function MessageList({ messages, isAssistantBusy = false }) {
    const messagesEndRef = createRef()

    function scrollToBottom() {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages]);

    return (
        <div className="flex-grow overflow-hidden p-3">
            <ul className="overflow-y-auto h-full space-y-2">
                {messages.map((msg, i, allMsg) => {
                    var isFirst = true;
                    if (i > 0) { isFirst = allMsg[i - 1].from !== msg.from }
                    return Message(msg, isFirst)
                })}
                {isAssistantBusy && <LoadingMessage />}
                <div ref={messagesEndRef} />
            </ul>
        </div>
    )
}

function ModelSelection({ llms, defaultLlm, onChangeLlm, dialogues, onChangeDialog, onCreateDialog }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-x-3">
                <label htmlFor="llm" className="w-16">LLM</label>
                {llms.length ? (
                    <select
                        id="llm"
                        name="llm"
                        autoComplete="off"
                        className="flex-grow block rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                        onChange={(e) => {
                            const llmId = e.target.value;
                            onChangeLlm(llmId)
                        }}
                        value={defaultLlm}>
                        {llms && llms.map(llm => <option key={llm._id} value={llm._id}>{llm.name}</option>)}
                    </select>
                ) : (
                    <a href="/llms">Create LLM</a>
                )}
            </div>
            <div className="flex items-center gap-x-3">
                <label htmlFor="dialog" className="w-16">Dialog</label>

                {dialogues.length ? (
                    <select
                        id="dialog"
                        name="dialog"
                        autoComplete="off"
                        className="flex-grow block rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                        onChange={(e) => {
                            const dialogId = e.target.value;
                            onChangeDialog(dialogId)
                        }}>
                        {dialogues && dialogues.map(dialog => <option key={dialog._id} value={dialog._id}>{dialog._id}</option>)}
                    </select>
                ) : (
                    <button
                        type="button"
                        disabled={!llms.length}
                        className="flex-grow p-2 bg-indigo-500 text-white border-0 rounded-r-lg hover:bg-indigo-600 disabled:bg-indigo-600/25"
                        onClick={onCreateDialog}>New</button>
                )}
            </div>
        </div>
    );
}

export function ExpandableModelSelection({ llms, dialogues, defaultLlm, onChangeLlm, onChangeDialog, onCreateDialog }) {
    const [isChatSettingExpanded, setIsChatSettingExpanded] = useState(false);

    return (
        <>
            {isChatSettingExpanded && (
                <div className="p-2">
                    <ModelSelection
                        llms={llms}
                        defaultLlm={defaultLlm}
                        onChangeLlm={onChangeLlm}
                        dialogues={dialogues}
                        onChangeDialog={onChangeDialog}
                        onCreateDialog={onCreateDialog} />
                </div>
            )}
            <div
                onClick={() => setIsChatSettingExpanded(!isChatSettingExpanded)}
                className="flex justify-center m-1 border-dashed border-2 rounded-md border-slate-300 hover:border-slate-500 hover:bg-orange-200/50">
                {isChatSettingExpanded ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>)
                }
            </div>
        </>
    );
}
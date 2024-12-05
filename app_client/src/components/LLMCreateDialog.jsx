import { useState, useEffect } from "react"
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

function PromptsList({ prompts, selectedPrompt, setSelectedPrompt }) {
    return (
        <div className="w-64">
            <Listbox value={selectedPrompt} onChange={setSelectedPrompt}>
                <div className="relative mt-1">
                    <ListboxButton className="w-full py-2 px-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <span className="block truncate">{selectedPrompt ? selectedPrompt.name : "-"}</span>
                    </ListboxButton>
                    <ListboxOptions className="absolute w-full mt-1 text-left bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none">
                        {prompts && prompts.map((prompt) => (
                            <ListboxOption
                                key={prompt._id}
                                value={prompt}
                                className={({ active }) =>
                                    `cursor-pointer select-none relative py-2 px-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                    }`
                                }
                            >
                                {({ selected }) => (
                                    <div>
                                        <p className={`font-medium ${selected ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {prompt.name}
                                        </p>
                                        <p className="text-sm text-gray-500 line-clamp-[9]">{prompt.content}</p>
                                    </div>
                                )}
                            </ListboxOption>
                        ))}
                    </ListboxOptions>
                </div>
            </Listbox>
        </div>
    )
}

export default function LlmCreateDialog({ open, onClose }) {
    const [llmOptions, setLlmOptions] = useState();
    const [formProviders, setFormProviders] = useState();
    const [formModels, setFormModels] = useState();
    const [form, setForm] = useState({
        provider: "",
        name: "",
        model: "",
        description: "",
        prompt: "",
        vendorId: ""
    });
    const [isNew, setIsNew] = useState(true);

    const [prompts, setPrompts] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    useEffect(() => {
        async function fetchLlmOptions() {
            const response = await fetch(
                "http://localhost:3000/api/configoptions/llm"
            );
            if (!response.ok) {
                const message = `An error has occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const options = await response.json();
            const defaultProviderName = Object.keys(options)[0];
            setLlmOptions(options)
            setFormProviders(Object.keys(options))
            setFormModels(options[defaultProviderName])
            updateForm({ provider: defaultProviderName, model: options[defaultProviderName][0] })

            const responsePrompts = await fetch(
                "http://localhost:3000/api/prompts?type=prompt"
            );
            const prompts = await responsePrompts.json();
            setPrompts(prompts)
            setSelectedPrompt(prompts[0])
            updateForm({ prompt: prompts[0]._id })
        }
        fetchLlmOptions();
        return;
    }, []);

    function updateForm(form) {
        return setForm((prev) => {
            return { ...prev, ...form };
        });
    }

    async function onSubmit(e) {
        e.preventDefault();
        const llm = { ...form };
        let response;
        try {
            if (isNew) {
                // POST new llm
                response = await fetch("http://localhost:3000/api/llms", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(llm),
                });
            } else {
                // PATCH existing llm
                response = await fetch(`http://localhost:3000/api/llms/${params.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(llm),
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('A problem occurred adding or updating a record: ', error);
        } finally {
            setForm({
                provider: "",
                name: "",
                model: "",
                description: "",
                prompt: "",
                vendorId: ""
            });
            onClose(await response.json());
        }
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            className="relative z-10 focus:outline-none">
            <DialogBackdrop className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                        className="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-3xl duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0">
                        <form onSubmit={onSubmit}>
                            <div className="space-y-12">

                                <div className="border-b border-gray-900/10 pb-12">
                                    <h2 className="text-base font-semibold leading-7 text-gray-900">New LLM</h2>
                                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                                        <div className="col-span-full">
                                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                                Name
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    autoComplete="off"
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                    value={form.name}
                                                    onChange={(e) => updateForm({ name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-full">
                                            <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                                                Description
                                            </label>
                                            <div className="mt-2">
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    rows={3}
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                    value={form.description}
                                                    onChange={(e) => updateForm({ description: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-full">
                                            <div className="flex gap-2 mt-2">
                                                <div className="inline-flex items-center gap-x-3">
                                                    <div className="sm:col-span-3">
                                                        <label htmlFor="provider" className="block text-sm font-medium leading-6 text-gray-900">Provider</label>
                                                        <div className="mt-2">
                                                            <select
                                                                id="provider"
                                                                name="provider"
                                                                autoComplete="off"
                                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                                                value={form.provider}
                                                                onChange={(e) => {
                                                                    const providerName = e.target.value;
                                                                    updateForm({ provider: providerName, model: llmOptions[providerName][0] });
                                                                    setFormModels(llmOptions[providerName])
                                                                }}>
                                                                {formProviders && formProviders.map(provider => <option key={provider}>{provider}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="inline-flex items-center gap-x-3">
                                                    <div className="sm:col-span-3">
                                                        <label htmlFor="model" className="block text-sm font-medium leading-6 text-gray-900">Model</label>
                                                        <div className="mt-2">
                                                            <select
                                                                id="model"
                                                                name="model"
                                                                autoComplete="off"
                                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                                                                value={form.model}
                                                                onChange={(e) => updateForm({ model: e.target.value })}>
                                                                {formModels && formModels.map(model => <option key={model}>{model}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-full">
                                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                                                Instruction
                                            </label>
                                            <div className="mt-2">
                                                <PromptsList
                                                    prompts={prompts}
                                                    selectedPrompt={selectedPrompt}
                                                    setSelectedPrompt={(prompt) => {
                                                        updateForm({ prompt: prompt._id })
                                                        setSelectedPrompt(prompt)
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-full">
                                            <label htmlFor="vendorId" className="block text-sm font-medium leading-6 text-gray-900">
                                                Vendor Id
                                            </label>
                                            <div className="mt-2">
                                                <input
                                                    id="vendorId"
                                                    name="vendorId"
                                                    type="text"
                                                    disabled
                                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-slate-50"
                                                    value={form.vendorId}
                                                    onChange={(e) => updateForm({ vendorId: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>

                            <div className="mt-6 flex items-center justify-end gap-x-6">
                                <button
                                    type="button"
                                    className="text-sm font-semibold leading-6 text-gray-900"
                                    onClick={onClose}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}
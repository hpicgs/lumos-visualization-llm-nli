import { useState } from "react"
import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react'

export default function PromptCreateDialog({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    content: "",
    type: "",
    subprompts: []
  });
  const [isNew, setIsNew] = useState(true);

  function updateForm(form) {
    return setForm((prev) => {
      return { ...prev, ...form };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    const prompt = { ...form };
    let response;
    try {
      if (isNew) {
        // POST new prompt
        response = await fetch("http://localhost:3000/api/prompts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prompt),
        });
      } else {
        // PATCH existing prompt
        response = await fetch(`http://localhost:3000/api/prompts/${params.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(prompt),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('A problem occurred adding or updating a record: ', error);
    } finally {
      setForm({ name: "", content: "", type: "", subprompts: [] });
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
                  <h2 className="text-base font-semibold leading-7 text-gray-900">New Prompt</h2>
                  <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

                    <div className="col-span-full">
                      <label className="block text-sm font-medium leading-6 text-gray-900">Prompt Type</label>
                      <div className="flex gap-10 mt-2">
                        <div className="inline-flex items-center gap-x-3">
                          <input
                            id="prompt-complete"
                            name="prompt-type-options"
                            type="radio"
                            value="prompt"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            checked={form.type === "prompt"}
                            onChange={(e) => updateForm({ type: e.target.value })}
                          />
                          <label htmlFor="prompt-complete" className="block text-sm font-medium leading-6 text-gray-900">
                            Complete Prompt
                          </label>
                        </div>
                        <div className="inline-flex items-center gap-x-3">
                          <input
                            id="prompt-block"
                            name="prompt-type-options"
                            type="radio"
                            value="block"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            checked={form.type === "block"}
                            onChange={(e) => updateForm({ type: e.target.value })}
                          />
                          <label htmlFor="prompt-block" className="block text-sm font-medium leading-6 text-gray-900">
                            Prompt Block
                          </label>
                        </div>
                      </div>
                    </div>

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
                      <label htmlFor="content" className="block text-sm font-medium leading-6 text-gray-900">
                        Content
                      </label>
                      <div className="mt-2">
                        <textarea
                          id="content"
                          name="content"
                          rows={3}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          value={form.content}
                          onChange={(e) => updateForm({ content: e.target.value })}
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
                  onClick={onClose}
                >
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
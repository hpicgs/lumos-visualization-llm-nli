import { useEffect, useState } from "react";
import FileCreateDialog from "./FileCreateDialog";

function File({ file }) {
    return (
        <li className="flex justify-between gap-x-6 py-5">
            <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto text-left">
                    <p className="text-m font-semibold leading-6 text-gray-900">{file.name}</p>
                    <p className={"mt-1 text-sm leading-5 text-gray-500"}>{file.description}</p>
                </div>
            </div>
        </li>
    );
}

export default function FileList() {
    const [files, setFiles] = useState([]);
    const [isFileCreationOpen, setIsFileCreationOpen] = useState(false)

    useEffect(() => {
        async function fetchFiles() {
            const response = await fetch(
                "http://localhost:3000/api/files"
            );
            if (!response.ok) {
                const message = `An error has occurred: ${response.statusText}`;
                console.error(message);
                return;
            }
            const files = await response.json();
            setFiles(files)
        }
        fetchFiles();
        return;
    }, [files.length]);

    return (
        <>
            <div>
                <button
                    className="rounded-none bg-orange-100"
                    onClick={() => setIsFileCreationOpen(true)}
                >Add File</button>
            </div>

            {files.length ? (
                <ul role="list" className="divide-y divide-gray-100">
                    {files.map((file) => <File key={file._id} file={file} />
                    )}
                </ul>
            ) : (
                <div className="items-center">
                    <h1>Nothing here!</h1>
                    <p className="mt-2">
                        <i>No Files have been Created yet</i>
                    </p>
                </div>
            )}

            <FileCreateDialog
                open={isFileCreationOpen}
                onClose={(savedFile) => {
                    setIsFileCreationOpen(false)
                    setFiles((prev) => [...prev, savedFile])
                }} />
        </>
    );
}
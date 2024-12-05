import React from "react";

export default function Table({ data, columns, renderers = {} }) {
    return (
        <table className="w-full table-auto">
            <thead>
                <tr className="border-b-2 border-black">
                    {columns.map((col) => (
                        <th key={col.accessor} className="text-left text-base p-3">{col.header}</th>

                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className={`${rowIndex % 2 === 0 ? "bg-white" : "bg-indigo-50"} hover:bg-indigo-200`}>
                        {columns.map((col) => {
                            const Renderer = renderers[col.accessor];
                            return (
                                <td key={col.accessor} className="text-left text-base py-2 px-3">
                                    {Renderer ? (
                                        <Renderer value={row[col.accessor]} row={row} />
                                    ) : (
                                        row[col.accessor]
                                    )}
                                </td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table >
    );
};
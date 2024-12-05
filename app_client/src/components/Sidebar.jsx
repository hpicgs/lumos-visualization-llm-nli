import { Link } from 'react-router-dom';

const settingItems = [
    { path: '/prompts', label: 'Prompts' },
    { path: '/llms', label: "LLM's" },
    { path: '/files', label: 'Files' },
    { path: '/tests', label: 'Tests' },
];

export default function Sidebar() {
    return (
        <>
            <aside
                id="sidebar"
                className={"h-full bg-gray-50"}
                aria-label="Sidebar"
            >
                <div className="flex shrink-0 px-8 items-center justify-between h-[96px]">
                    <a
                        className="transition-colors duration-200 ease-in-out text-5xl font-serif"
                        href="/"
                    >
                        Lumos
                    </a>
                </div>
                {/* Menu Items */}
                <div className="h-full px-3 py-4 overflow-y-auto">
                    <div className="flex flex-col w-full font-medium">

                        <div>
                            <span className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
                                <a
                                    href="/candlestick"
                                    className="flex items-center flex-grow text-[1.15rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
                                >
                                    Use-Case
                                </a>
                            </span>
                        </div>

                        <div className="block pt-5 pb-[.15rem]">
                            <div className="px-4 py-[.65rem]">
                                <span className="font-semibold text-[0.95rem] uppercase dark:text-neutral-500/80 text-secondary-dark">
                                    Settings
                                </span>
                            </div>
                        </div>

                        {settingItems.map((item, index) => (
                            <div key={index}>
                                <span className="select-none flex items-center px-4 py-[.775rem] cursor-pointer my-[.4rem] rounded-[.95rem]">
                                    <Link
                                        to={item.path}
                                        className="flex items-center flex-grow text-[1.15rem] dark:text-neutral-400/75 text-stone-500 hover:text-dark"
                                    >
                                        {item.label}
                                    </Link>
                                </span>
                            </div>
                        ))}

                    </div>
                </div>
            </aside>
        </>
    );
}
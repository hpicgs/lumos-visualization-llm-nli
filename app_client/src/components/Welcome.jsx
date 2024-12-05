export default function Welcome() {
    return (
        <>
            <div className="w-full h-full pt-5 items-center">
                <h1>Welcome to Lumos</h1>
                <div className="p-5 mt-5 space-y-5">
                    <p className="italic font-semibold">Don't forget to setup Lumos. See readme for instructions.</p>
                    <p className="pt-5">
                        Navigate to <span className="italic font-semibold">Use-Case</span> to explore the Lumos system use-case
                    </p>
                    <p>or</p>
                    <p>Explore backend entities under <span className="italic font-semibold">Settings</span></p>
                </div>
            </div>
        </>
    )
}
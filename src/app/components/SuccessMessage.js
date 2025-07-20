

export default function SuccessMessage({ close, fetchTask }) {

    const nextTask = () => {
        close()
        fetchTask()
    }

    return (
        <div className="fixed left-0 top-0 h-screen w-screen backdrop-blur bg-white/20 flex items-center justify-center z-10">
            <div className="bg-black p-4 min-w-96">
                <h2 className="text-2xl">Correct!</h2>
                <div className="py-4"></div>
                <div className="flex justify-between gap-4">
                    <button className="px-2 py-1 border border-slate-500 h-fit rounded" onClick={close}>Close</button>
                    <button className="px-2 py-1 bg-slate-700 h-fit rounded" onClick={nextTask}>Next</button>
                </div>
            </div>
        </div>
    )
}
"use client"

export default function SuccessMessage({ close, fetchTask }) {

    const nextTask = () => {
        close()
        fetchTask()
    }

    return (
        <div className="flex bg-[green] justify-end mt-32 fixed bottom-0 left-0 p-4 w-full z-10">
            <div className="bg-[green] w-full">
                <h2 className="text-2xl">Correct!</h2>
                <div className="py-4"></div>
                <div className="flex justify-end gap-4">
                    <button className="p-2 bg-slate-700 h-fit rounded-lg" onClick={nextTask}>Next</button>
                </div>
            </div>
        </div>
    )
}


export default function TimeTracking({ close }) {

    const handleSubmit = e => {

    }

    return (
        <div className="fixed left-0 top-0 h-screen w-screen backdrop-blur bg-white/20 flex items-center justify-center z-10">
            <form className="bg-black p-4" onSubmit={handleSubmit}>
                <div className="flex justify-between gap-4">
                    <button onClick={close} type="button">Close</button>
                    <button type="submit">Track</button>
                </div>
            </form>
        </div>
    )
}
import axios from "axios"

export default function FixPronunciation({ close, resetTask }) {

    const handleSubmit = async e => {
        e.preventDefault()
        try {
            await axios({
                method: "post",
                url: "/api/add-pronunciation",
                data: Object.fromEntries(new FormData(e.target))
            })
            await resetTask()
            close()
        } catch (err) {
            alert(err?.message, err?.response?.data)
        }
    }

    return (
        <div className="fixed left-0 top-0 h-screen w-screen backdrop-blur bg-white/20 flex items-center justify-center z-10">
            <form className="bg-black p-4" onSubmit={handleSubmit}>
                <h2 className="text-2xl">Fix Pronunciation</h2>
                <div className="flex gap-2 my-8">
                    <div>
                        <div className="text-slate-400">Hi</div>
                        <input className="bg-transparent border border-slate-500 px-2 py-1" name="hi" required/>
                    </div>
                    <div>
                        <div className="text-slate-400">Pronunciation</div>
                        <input className="bg-transparent border border-slate-500 px-2 py-1" name="en_transliteration" required/>
                    </div>
                </div>
                <div className="flex justify-between gap-4">
                    <button className="px-2 py-1 border border-slate-500 h-fit rounded" onClick={close} type="button">Close</button>
                    <button className="px-2 py-1 bg-slate-700 h-fit rounded" type="submit">Fix</button>
                </div>
            </form>
        </div>
    )
}
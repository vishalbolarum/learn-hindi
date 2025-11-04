
"use client"
import { useEffect, useState } from "react"
import axios from "axios"

export default function Page({ close }) {

    const [logs, setLogs] = useState([])
    const [allTimeTotal, setAllTimeTotal] = useState()

    const beautifyDuration = milliseconds => {
        const totalMinutes = Math.floor(milliseconds / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return { hours, minutes };
    }

    const fetchLogs = async () => {
        try {
            const { data } = await axios({
                url: "/api/logs"
            })
            setLogs(data.logs)
            setAllTimeTotal(data.all_time_total)
        } catch (err) {

        }
    }

    useEffect(() => {
        fetchLogs()
    }, [])

    return (
        <div className="fixed left-0 top-0 h-screen w-screen backdrop-blur bg-white/20 flex items-center justify-center z-10 p-4">
            <div className="bg-black px-4 max-w-[300px] w-full">
                <div className="my-4 flex justify-between">
                    <div>
                        <div className="text-slate-400 text-sm">All time total:</div>
                        <div className="my-2">
                            <span className="text-4xl">{beautifyDuration(allTimeTotal).hours}</span> hours {beautifyDuration(allTimeTotal).minutes} minutes.
                        </div>
                    </div>
                    <div className="text-[red] text-2xl cursor-pointer opacity-75" onClick={() => close()}>╳</div>
                </div>
                <div className="max-h-[500px] overflow-y-auto my-4">
                    <table className="w-full">
                        <tbody>
                            {logs.map((log, i) => (
                                <tr key={i}>
                                    <td className="border border-slate-700 px-2 py-1 text-xs text-slate-400">{log.date}</td>
                                    <td className="border border-slate-700 px-2 py-1 text-xs">{beautifyDuration(log.duration).hours} hours {beautifyDuration(log.duration).minutes} minutes.</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
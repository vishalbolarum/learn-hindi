import axios from "axios";
import { useState } from "react";

export default function AddSentence({ close, resetTask, task }) {

  const [loading, setLoading] = useState(false)
  const [defaultValues, setDefaultValues] = useState({
    hi: null,
    en: null
  })

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, en, hi } = Object.fromEntries(new FormData(e.target));
    try {
      if (![".", "?"].includes(en?.trim()?.slice(-1)))
        throw new Error(
          "The sentence needs to end with a period or question mark."
        );
      if (en?.trim()?.slice(0, 1) !== en?.trim()?.slice(0, 1)?.toUpperCase())
        throw new Error(
          "The sentence needs to start with an uppercase character."
        );
      await axios({
        method: "post",
        url: "/api/add",
        data: {
          id,
          en,
          hi,
        },
      });
      await resetTask()
      close();
    } catch (err) {
      alert(err?.message, err?.response?.data);
    }
  };

  const fillFields = e => {
    setLoading(true)
    if (Number(e.target.value) === Number(task.id)) {
      setDefaultValues({
        en: task.en,
        hi: task.hi
      })
    } else {
      setDefaultValues({
        en: null,
        hi: null
      })
    }
    setLoading(false)
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-screen backdrop-blur bg-white/20 flex items-center justify-center z-10">
      <form className="bg-black p-4 max-w-lg w-full" onSubmit={handleSubmit}>
        <h2 className="text-2xl">Add Sentence</h2>
        <div className="my-8">
          <div>
            <div className="text-slate-400 my-1">Task ID</div>
            <select className="px-2 py-1 border border-slate-400" name="id" onChange={fillFields}>
              <option value=""></option>
              <option value={task.id}>{task.id}</option>
            </select>
          </div>

          {loading ? <></> : (
            <>
              <div className="my-4">
              <div className="text-slate-400 my-1">Hindi</div>
              <input
                className="bg-transparent border border-slate-500 px-2 py-1 w-full"
                name="hi"
                autoComplete="off"
                minLength={3}
                defaultValue={defaultValues.hi}
                required
              />
            </div>
            <div className="my-4">
              <div className="text-slate-400 my-1">English</div>
              <input
                className="bg-transparent border border-slate-500 px-2 py-1 w-full"
                name="en"
                autoComplete="off"
                minLength={3}
                defaultValue={defaultValues.en}
                required
              />
            </div>
            </>
          )}

        </div>

        <div className="flex justify-between gap-4">
          <button
            className="px-2 py-1 border border-slate-500 h-fit rounded"
            onClick={close}
            type="button"
          >
            Close
          </button>
          <button
            className="px-2 py-1 bg-slate-700 h-fit rounded"
            type="submit"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}

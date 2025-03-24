"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export default function Home() {

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [questionNumber, setQuestionNumber] = useState(Number(searchParams.get("question_number")) || 0)

  const [task, setTask] = useState()

  const [answer, setAnswer] = useState([])
  const [options, setOptions] = useState([])

  const [hiToEn, setHiToEn] = useState(false)

  const speak = (message) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = "hi-IN"
      window.speechSynthesis.speak(utterance)
    } else {
      console.error("Speech Synthesis not supported in this browser.");
    }
  };

  const fetchTask = async () => {
    setTask(null)
    setAnswer([])
    setOptions([])
    try {
      const { data } = await axios({
        url: "/api/random",
        params: {
          question_number: questionNumber
        }
      })
      setQuestionNumber(prev => prev + 1)
      setTask(data.task)
      // if (hiToEn) {
      //   setHiToEn(false)
      //   setOptions(data.task.hi_tokens?.sort(() => Math.random() - 0.5))
      // } else {
        setHiToEn(true)
        setOptions(data.task.en_tokens?.sort(() => Math.random() - 0.5))
        speak(data.task.hi)
      // }
    } catch (err) {

    }
  }

  const chooseWord = obj => {
    if (!hiToEn) {
      speak(obj.word)
    }
    setOptions(prev => prev.filter(ob => ob.order !== obj.order))
    setAnswer(prev => [...prev, obj])
  }

  const removeWord = obj => {
    setAnswer(prev => prev.filter(ob => ob.order !== obj.order))
    setOptions(prev => [...prev, obj])
  }

  const check = () => {
    let user_answer = answer.map(obj => obj.word).join(" ")
    let actual_answer = task[hiToEn ? "en_tokens" : "hi_tokens"].sort((a, b) => a.order - b.order).map(obj => obj.word).join(" ")


    if (user_answer === actual_answer) {
      alert("Correct!")
      fetchTask()
    } else {
      alert(`Wrong! Correct answer is:\n${task.hi_tokens.map(token => token.word_transliterated).join(" ")}`)
    }
  }

  const copyText = async text => {
    await navigator.clipboard.writeText(text)
    speak(text)
  }

  const copyTranslateSpeak = async obj => {
    speak(obj.word)
    const { data } = await axios({
      url: "/api/word-meaning",
      params: {
        source: "hi",
        target: "en",
        word: obj.word
      }
    })
    alert(data.word_translated)
  }

  useEffect(() => {
    fetchTask()
  }, [])

  return (
    <main className="px-4">
      <div className="my-8">
        <h1 className="my-4 text-5xl">Learn Hindi</h1>
        <div className="my-4 text-slate-400">Translate this Hindi sentence into English.</div>
      </div>
      
      {hiToEn ? (
        <div className="flex gap-4">
          <div className="text-3xl">
            {task?.hi_tokens?.map(obj => (
              <div className="inline-block mr-4" key={obj.order} onClick={() => copyTranslateSpeak(obj)}>
                <div>{obj?.word}</div>
                <div className="text-sm text-center select-none">{obj?.word_transliterated}</div>
                <div className="text-sm my-2 text-center select-none text-green-500">{obj?.word_translated}</div>
              </div>
            ))}
          </div>
          <div className="bg-slate-700 w-fit h-fit p-4 rounded-lg cursor-pointer active:bg-slate-800" onClick={() => speak(task.hi)}>
            <Image className="w-6 h-6 invert" src="https://cdn-icons-png.flaticon.com/512/59/59284.png" alt="" width={0} height={0}/>
          </div>
        </div>
        ) : (
          <div className="text-2xl">
            {task?.en}
          </div>
        )}
  
      <div className="flex flex-wrap gap-2 p-2 my-8 w-full min-h-32 border border-slate-500">
        {answer?.map(obj => (
          <div className="h-fit cursor-pointer select-none" key={obj.order}>
            <div className="bg-slate-800 h-fit rounded px-2 py-2 cursor-pointer select-none"  onClick={() => removeWord(obj)}>
                <div className="text-2xl text-center">{obj.word}</div>
                {!hiToEn && <div className="text-center text-slate-300 select-none">{obj?.word_transliterated}</div>}
              </div>
              {!hiToEn && <Image className="invert h-4 w-4 mx-auto my-2 opacity-30 hover:opacity-100 cursor-pointer" src="https://cdn-icons-png.flaticon.com/512/9321/9321839.png" width={0} height={0} alt="" onClick={() => copyText(obj.word)}/>}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {options?.map(obj => (
          <div key={obj.order}>
              <div className="bg-slate-800 h-fit rounded px-2 py-2 cursor-pointer select-none"  onClick={() => chooseWord(obj)}>
                <div className="text-2xl text-center">{obj.word}</div>
                {!hiToEn && <div className="text-center text-slate-300">{obj?.word_transliterated}</div>}
              </div>
              {!hiToEn && <Image className="invert h-4 w-4 mx-auto my-2 opacity-30 hover:opacity-100 cursor-pointer" src="https://cdn-icons-png.flaticon.com/512/9321/9321839.png" width={0} height={0} alt="" onClick={() => copyText(obj.word)}/>}
          </div>
  
        ))}
      </div>

      <div className="flex justify-between mt-32">
        <button className="bg-red-700 p-2 rounded-lg">Regenerate</button>
        <button className="bg-green-700 p-2 rounded-lg" onClick={check}>Check</button>
      </div>
    </main>
  );
}

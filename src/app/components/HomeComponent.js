"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import FixPronunciation from "./FixPronunciation"
import FixSentence from "./FixSentence"
import TimeTracking from "./TimeTracking"
import SuccessMessage from "./SuccessMessage"
import stop_words from "./stop_words.json"
import { Languages, Volume2 } from "lucide-react";

export default function HomeComponent() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const formRef = useRef(null);

	const [task, setTask] = useState(
		// {
		// 	"hi": "हर दिन खूब पानी पिएं।",
		// 	"hi_tokens": [
		// 		{
		// 			"word": "हर",
		// 			"word_transliterated": "har",
		// 			"order": 0
		// 		},
		// 		{
		// 			"word": "दिन",
		// 			"word_transliterated": "din",
		// 			"order": 1
		// 		},
		// 		{
		// 			"word": "खूब",
		// 			"word_transliterated": "khuub",
		// 			"order": 2
		// 		},
		// 		{
		// 			"word": "पानी",
		// 			"word_transliterated": "paanee",
		// 			"order": 3
		// 		},
		// 		{
		// 			"word": "पिएं",
		// 			"word_transliterated": "pien",
		// 			"order": 4
		// 		}
		// 	],
		// 	"en": "Drink plenty of water every day.",
		// 	"en_tokens": [
		// 		{
		// 			"word": "drink",
		// 			"word_transliterated": "drink",
		// 			"order": 0
		// 		},
		// 		{
		// 			"word": "plenty",
		// 			"word_transliterated": "plenty",
		// 			"order": 1
		// 		},
		// 		{
		// 			"word": "of",
		// 			"word_transliterated": "of",
		// 			"order": 2
		// 		},
		// 		{
		// 			"word": "water",
		// 			"word_transliterated": "water",
		// 			"order": 3
		// 		},
		// 		{
		// 			"word": "every",
		// 			"word_transliterated": "every",
		// 			"order": 4
		// 		},
		// 		{
		// 			"word": "day",
		// 			"word_transliterated": "day",
		// 			"order": 5
		// 		}
		// 	]
		// }
	);

	const [answer, setAnswer] = useState([]);
	const [options, setOptions] = useState([
		// {
		// 	"word": "हर",
		// 	"word_transliterated": "har",
		// 	"order": 0
		// },
		// {
		// 	"word": "दिन",
		// 	"word_transliterated": "din",
		// 	"order": 1
		// },
		// {
		// 	"word": "खूब",
		// 	"word_transliterated": "khuub",
		// 	"order": 2
		// },
		// {
		// 	"word": "पानी",
		// 	"word_transliterated": "paanee",
		// 	"order": 3
		// },
		// {
		// 	"word": "पिएं",
		// 	"word_transliterated": "pien",
		// 	"order": 4
		// }
	]);

	const [hiToEn, setHiToEn] = useState(true);

	const [showFixPronunciation, toggleFixPronunciation] = useState()
	const [showFixSentence, toggleFixSentence] = useState()
	const [showTimeTracking, toggleTimeTracking] = useState()
	const [showSuccessMessage, toggleSuccessMessage] = useState()

	const speak = (message) => {
		if (typeof window !== "undefined" && "speechSynthesis" in window) {
			const utterance = new SpeechSynthesisUtterance(message);
			utterance.lang = "hi-IN";
			window.speechSynthesis.cancel()
			window.speechSynthesis.speak(utterance);
		} else {
			console.error("Speech Synthesis not supported in this browser.");
		}
	};

	const fetchTask = async () => {
		setTask(null);
		setAnswer([]);
		setOptions([]);
		try {
			const { data } = await axios({
				url: "/api/tasks",
				params: {
					difficulty: searchParams.get("difficulty"),
					category: searchParams.get("category")
				},
			});
			setTask(data);
			if (hiToEn) {
				setHiToEn(false);
				setOptions(
					data.hi_tokens?.sort((a, b) => a.random_order - b.random_order)
				);
			} else {
				setHiToEn(true);
				setOptions(
					data.en_tokens?.sort((a, b) => a.random_order - b.random_order)
				);
				speak(data.hi);
			}
		} catch (err) {
			console.log(err.toString());
		}
	};

	const chooseWord = (obj) => {
		if (!hiToEn) {
			speak(obj.word);
		}
		setOptions((prev) => prev?.filter((ob) => ob.order !== obj.order).sort((a, b) => a.random_order - b.random_order));
		setAnswer((prev) => [...prev, obj]);
	};

	const removeWord = (obj) => {
		setAnswer((prev) => prev.filter((ob) => ob.order !== obj.order));
		setOptions((prev) => [...prev, obj]);
	};

	const check = (e) => {
		e.preventDefault();
		const formData = Object.fromEntries(new FormData(e.target));
		let actual_answer = task[hiToEn ? "en_tokens" : "hi_tokens"]
				.sort((a, b) => a.order - b.order)
				.map((obj) => obj.word)
				.join(" ");
		let user_answer = answer.map((obj) => obj.word).join(" ");
		if (user_answer === actual_answer) {
			toggleSuccessMessage(true)
		} else {
			alert(
				`Wrong! Correct answer is:\n${hiToEn ? task.en : task.hi_tokens
					.map((token) => token.word_transliterated)
					.join(" ")}`
			);
		}
	};

	const copyText = async (text) => {
		await navigator.clipboard.writeText(text);
	};

	const copyTranslateSpeak = async (obj) => {
		speak(obj.word);
		await copyText(obj.word);
		const { data } = await axios({
			url: "/api/word-meaning",
			params: {
				source: "hi",
				target: "en",
				word: obj.word,
			},
		});
		console.log(data)
		if (data.word_translated) {
			alert(data.word_translated);
		} else {
			console.log(JSON.stringify(data.env));
			alert(JSON.stringify(data.env));
		}
	};

	const resetTask = async () => {
		setAnswer([]);
		try {
			const { data } = await axios({
				url: "/api/tasks",
				params: {
					id: task.id,
				}
			});
			setTask(data);
			if (hiToEn) {
				setOptions(
					data.en_tokens?.sort((a, b) => a.random_order - b.random_order)
				);
			} else {
				setOptions(
					data.hi_tokens?.sort((a, b) => a.random_order - b.random_order)
				);
			}
		} catch (err) {
			console.log(err.toString());
		}
	}

	useEffect(() => {
		fetchTask();
	}, [searchParams]);

	return (
		<main>
			{showFixPronunciation && <FixPronunciation close={() => toggleFixPronunciation(false)} resetTask={resetTask}/>}
			{showFixSentence && <FixSentence close={() => toggleFixSentence(false)} resetTask={resetTask} task={task}/>}
			{showTimeTracking && <TimeTracking close={() => toggleTimeTracking(false)}/>}
			{showSuccessMessage && <SuccessMessage close={() => toggleSuccessMessage(false)} fetchTask={fetchTask} />}
			<div className="min-h-screen w-full">
				<div className="px-4">
					<div className="py-4 flex gap-2 justify-between">
						<div>
							<h1 className="my-2 text-3xl">Learn Hindi</h1>
								<div className="my-2 text-sm text-slate-400">
									{hiToEn ? "Translate this Hindi sentence into English." : "Translate this English sentence into Hindi."} {task?.google_verified && <span className="text-green-400">✔</span>}
								</div>
						</div>
						<div className="flex flex-wrap gap-2">
							{/* <Image className="invert w-4 h-4 my-2 cursor-pointer hover:opacity-80" src="https://cdn-icons-png.flaticon.com/512/15339/15339188.png" onClick={() => toggleTimeTracking(true)} width={0} height={0} alt=""/> */}
							<button className="bg-slate-800 h-fit px-2 py-1 rounded text-sm" onClick={() => toggleFixPronunciation(true)}>Fix Pronunciation</button>
							<button className="bg-slate-600 h-fit px-2 py-1 rounded text-sm" onClick={() => toggleFixSentence(true)}>Fix Sentence</button>
						</div>
					</div>

					<div className="py-2"></div>

					{hiToEn ? (
						<div className="flex gap-2">
							<div>
								{task?.hi_tokens?.sort((a, b) => a.order - b.order)?.map((obj) => (
									<div
										className="inline-block text-2xl mr-2"
										key={obj.order}
										onClick={() => copyTranslateSpeak(obj)}
									>
										<div className="text-xl">{obj?.word}</div>
										<div className={`${obj.verified_pronunciation ? "text-slate-400" : "text-sky-400"} select-none text-center text-xs`}>
											{obj?.word_transliterated}
										</div>
										<div className="text-sm my-2 text-center select-none text-green-500">
											{obj?.word_translated}
										</div>
									</div>
								))}
							</div>
							<div
								className="bg-slate-700 w-fit h-fit p-3 rounded-lg cursor-pointer active:bg-slate-800"
								onClick={() => {copyText(task.hi);speak(task.hi)}}
							>
								<Volume2
									size={20}
								/>
							</div>
						</div>
					) : (
						<div className="text-xl">{task?.en}</div>
					)}

					<form ref={formRef} onSubmit={check}>
						{/* {hiToEn && (
							<div className="my-4">
								<input
									className="bg-transparent border border-slate-500 w-full p-2"
									name="user_answer"
									autoComplete="off"
								></input>
							</div>
						)} */}


							<div>
								<div className="p-2 my-4 w-full min-h-32 border border-slate-500 flex gap-4">
									<div className="flex flex-wrap gap-2 min-h-full w-full">
										{answer?.map((obj) => (
											<div
												className="h-fit cursor-pointer select-none"
												key={obj.order}
											>
												<div
													className="bg-slate-800 h-fit rounded px-2 py-2 cursor-pointer select-none"
													onClick={() => removeWord(obj)}
												>
													<div className={`${hiToEn ? "text-sm" : "text-base"} text-center`}>
														{obj.word}
													</div>
													{!hiToEn && (
														<div className={`${obj.verified_pronunciation ? "text-slate-400" : "text-sky-400"} text-center text-xs`}>
															{obj?.word_transliterated}
														</div>
													)}
												</div>
												{!hiToEn && (
													<Languages
														className="mx-auto mt-2 opacity-30 hover:opacity-100 cursor-pointer"
														size={16}
														onClick={() => {copyTranslateSpeak(obj)}}
													/>
												)}
											</div>
										))}
									</div>
									{!hiToEn && (				
										<div>
											<Volume2
												className="mx-auto opacity-30 hover:opacity-100 cursor-pointer"
												size={24}
												onClick={() => speak(answer.map(obj => obj.word).join(" "))}
											/>
										</div>
									)}
								</div>

								<div className="flex flex-wrap gap-2">
									{options?.map((obj) => (
										<div key={obj.order}>
											<div
												className="bg-slate-800 h-fit rounded px-2 py-2 cursor-pointer select-none"
												onClick={() => chooseWord(obj)}
											>
												<div className={`${hiToEn ? "text-sm" : "text-base"} text-center`}>
													{obj.word}
												</div>
												{!hiToEn && (
													<div className={`${obj.verified_pronunciation ? "text-slate-400" : "text-sky-400"} text-center text-xs`}>
														{obj?.word_transliterated}
													</div>
												)}
											</div>
											{!hiToEn && (
												<Languages
													className="mx-auto mt-2 opacity-30 hover:opacity-100 cursor-pointer"
													size={16}
													onClick={() => {copyTranslateSpeak(obj)}}
												/>
											)}
										</div>
									))}
								</div>
							</div>

						<div className="fixed bottom-0 right-0">
							{/* <button className="bg-red-700 p-2 rounded-lg" type="button"></button> */}
							<button
								className="bg-slate-500 p-2 rounded-lg m-4"
								type="submit"
							>
								Check
							</button>
						</div>
					</form>
				</div>
			</div>
		</main>
	);
}

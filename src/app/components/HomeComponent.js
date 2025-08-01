"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import FixPronunciation from "./FixPronunciation"
import AddSentence from "./AddSentence"
import TimeTracking from "./TimeTracking"
import SuccessMessage from "./SuccessMessage"
import stop_words from "./stop_words.json"

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

	const [hiToEn, setHiToEn] = useState(false);

	const [showFixPronunciation, toggleFixPronunciation] = useState()
	const [showAddSentence, toggleAddSentence] = useState()
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
		speak(text);
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
			<div className="px-8 w-full">
			{showFixPronunciation && <FixPronunciation close={() => toggleFixPronunciation(false)} resetTask={resetTask}/>}
			{showAddSentence && <AddSentence close={() => toggleAddSentence(false)} resetTask={resetTask} task={task}/>}
			{showTimeTracking && <TimeTracking close={() => toggleTimeTracking(false)}/>}
			{showSuccessMessage && <SuccessMessage close={() => toggleSuccessMessage(false)} fetchTask={fetchTask} />}
			<div className="py-6 flex justify-between">
				<div>
					<h1 className="my-2 text-5xl">Learn Hindi</h1>
						<div className="my-2 text-slate-400">
							Translate this Hindi sentence into English.
						</div>
				</div>
				<div className="flex gap-2">
					<Image className="invert w-4 h-4 my-2 cursor-pointer hover:opacity-80" src="https://cdn-icons-png.flaticon.com/512/15339/15339188.png" onClick={() => toggleTimeTracking(true)} width={0} height={0} alt=""/>
					<button className="bg-slate-800 h-fit px-2 py-1 rounded" onClick={() => toggleFixPronunciation(true)}>Fix Pronunciation</button>
					<button className="bg-slate-600 h-fit px-2 py-1 rounded" onClick={() => toggleAddSentence(true)}>Add Sentence</button>
				</div>
			</div>

			<div className="py-2"></div>

			{hiToEn ? (
				<div className="flex gap-4">
					<div className="text-3xl">
						{task?.hi_tokens?.sort((a, b) => a.order - b.order)?.map((obj) => (
							<div
								className="inline-block mr-2"
								key={obj.order}
								onClick={() => copyTranslateSpeak(obj)}
							>
								<div>{obj?.word}</div>
								<div className={`${obj.verified_pronunciation ? "text-slate-400" : "text-sky-400"} select-none text-center text-sm`}>
									{obj?.word_transliterated}
								</div>
								<div className="text-sm my-2 text-center select-none text-green-500">
									{obj?.word_translated}
								</div>
							</div>
						))}
					</div>
					<div
						className="bg-slate-700 w-fit h-fit p-4 rounded-lg cursor-pointer active:bg-slate-800"
						onClick={() => {copyText(task.hi);speak(task.hi)}}
					>
						<Image
							className="w-6 h-6 invert"
							src="https://cdn-icons-png.flaticon.com/512/59/59284.png"
							alt=""
							width={0}
							height={0}
						/>
					</div>
				</div>
			) : (
				<div className="text-2xl">{task?.en}</div>
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
						<div className="p-2 my-6 w-full min-h-32 border border-slate-500 flex gap-4">
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
											<div className={`${hiToEn ? "" : "text-2xl"} text-center`}>
												{obj.word}
											</div>
											{!hiToEn && (
												<div className={`${obj.verified_pronunciation ? "text-slate-400" : "text-sky-400"} text-center text-xs`}>
													{obj?.word_transliterated}
												</div>
											)}
										</div>
										{!hiToEn && (
											<Image
												className="invert h-4 w-4 mx-auto my-2 opacity-30 hover:opacity-100 cursor-pointer"
												src="https://cdn-icons-png.flaticon.com/512/59/59284.png"
												width={0}
												height={0}
												alt=""
												onClick={() => copyText(obj.word)}
											/>
										)}
									</div>
								))}
							</div>
							{!hiToEn && (				
								<div>
									<Image
										className="invert h-6 w-6 mx-auto opacity-30 hover:opacity-100 cursor-pointer"
										src="https://cdn-icons-png.flaticon.com/512/59/59284.png"
										width={0}
										height={0}
										alt=""
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
										<div className={`${hiToEn ? "" : "text-2xl"} text-center`}>
											{obj.word}
										</div>
										{!hiToEn && (
											<div className={`${obj.verified_pronunciation ? "text-slate-400" : "text-sky-400"} text-center text-xs`}>
												{obj?.word_transliterated}
											</div>
										)}
									</div>
									{!hiToEn && (
										<Image
											className="invert h-4 w-4 mx-auto my-2 opacity-30 hover:opacity-100 cursor-pointer"
											src="https://cdn-icons-png.flaticon.com/512/59/59284.png"
											width={0}
											height={0}
											alt=""
											onClick={() => copyText(obj.word)}
										/>
									)}
								</div>
							))}
						</div>
					</div>

				<div className="flex justify-end mt-32 fixed bottom-0 left-0 p-4 w-full">
					{/* <button className="bg-red-700 p-2 rounded-lg" type="button"></button> */}
					<button
						className="bg-slate-500 p-2 rounded-lg"
						type="submit"
					>
						Check
					</button>
				</div>
			</form>
			</div>
		</main>
	);
}

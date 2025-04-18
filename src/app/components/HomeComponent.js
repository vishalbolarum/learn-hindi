"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import FixPronunciation from "./FixPronunciation"
import AddSentence from "./AddSentence"

export default function HomeComponent() {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const formRef = useRef(null);

	const [task, setTask] = useState();

	const [answer, setAnswer] = useState([]);
	const [options, setOptions] = useState([]);

	const [hiToEn, setHiToEn] = useState(false);

	const [showFixPronunciation, toggleFixPronunciation] = useState()
	const [showAddSentence, toggleAddSentence] = useState()

	const speak = (message) => {
		if (typeof window !== "undefined" && "speechSynthesis" in window) {
			const utterance = new SpeechSynthesisUtterance(message);
			utterance.lang = "hi-IN";
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
				url: "/api/random",
				params: {
					difficulty: searchParams.get("difficulty"),
				},
			});
			if (data.error) {
				throw new Error(data.error);
			}
			setTask(data.task);
			if (hiToEn) {
				setHiToEn(false);
				setOptions(
					data.task.hi_tokens?.sort(() => Math.random() - 0.5)
				);
			} else {
				setHiToEn(true);
				setOptions(
					data.task.en_tokens?.sort(() => Math.random() - 0.5)
				);
				speak(data.task.hi);
			}
		} catch (err) {
			console.log(err.toString());
		}
	};

	const chooseWord = (obj) => {
		if (!hiToEn) {
			speak(obj.word);
		}
		setOptions((prev) => prev.filter((ob) => ob.order !== obj.order));
		setAnswer((prev) => [...prev, obj]);
	};

	const removeWord = (obj) => {
		setAnswer((prev) => prev.filter((ob) => ob.order !== obj.order));
		setOptions((prev) => [...prev, obj]);
	};

	const check = (e) => {
		e.preventDefault();
		const formData = Object.fromEntries(new FormData(e.target));
		if (hiToEn) {
			let user_answer = formData.user_answer
				?.replace(/[।.,?]/g, "")
				?.replace(/\s+/g, " ")
				?.toLowerCase()
				?.trim();
			let actual_answer = task[hiToEn ? "en_tokens" : "hi_tokens"]
				.sort((a, b) => a.order - b.order)
				.map((obj) => obj.word)
				.join(" ");
			if (user_answer === actual_answer) {
				alert("Correct!");
				formRef.current.reset();
				fetchTask();
			} else {
				alert(
					`Wrong! Correct answer is:\n${task.en_tokens
						.map((token) => token.word)
						.join(" ")}`
				);
			}
		} else {
			let user_answer = answer.map((obj) => obj.word).join(" ");
			let actual_answer = task[hiToEn ? "en_tokens" : "hi_tokens"]
				.sort((a, b) => a.order - b.order)
				.map((obj) => obj.word)
				.join(" ");
			if (user_answer === actual_answer) {
				alert("Correct!");
				fetchTask();
			} else {
				alert(
					`Wrong! Correct answer is:\n${task.hi_tokens
						.map((token) => token.word_transliterated)
						.join(" ")}`
				);
			}
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

	useEffect(() => {
		fetchTask();
	}, []);

	return (
		<main className="px-4 min-h-screen">
			{showFixPronunciation && <FixPronunciation close={() => toggleFixPronunciation(false)}/>}
			{showAddSentence && <AddSentence close={() => toggleAddSentence(false)}/>}
			<div className="py-6 flex justify-between">
				<div>
					<h1 className="my-2 text-5xl">Learn Hindi</h1>
						<div className="my-2 text-slate-400">
							Translate this Hindi sentence into English.
						</div>
				</div>
				<div className="flex gap-2">
					<button className="bg-slate-800 h-fit px-2 py-1 rounded" onClick={() => toggleFixPronunciation(true)}>Fix Pronunciation</button>
					<button className="bg-slate-600 h-fit px-2 py-1 rounded" onClick={() => toggleAddSentence(true)}>Add Sentence</button>
				</div>
			</div>

			<div className="py-2"></div>

			{hiToEn ? (
				<div className="flex gap-4">
					<div className="text-3xl">
						{task?.hi_tokens?.map((obj) => (
							<div
								className="inline-block mr-4"
								key={obj.order}
								onClick={() => copyTranslateSpeak(obj)}
							>
								<div>{obj?.word}</div>
								<div className="text-sm text-slate-400 text-center select-none">
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
						onClick={() => speak(task.hi)}
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
				{hiToEn && (
					<div className="my-8">
						<input
							className="bg-transparent border border-slate-500 w-full p-2"
							name="user_answer"
							autoComplete="off"
						></input>
					</div>
				)}

				{!hiToEn && (
					<div>
						<div className="flex flex-wrap gap-2 p-2 my-6 w-full min-h-32 border border-slate-500">
							{answer?.map((obj) => (
								<div
									className="h-fit cursor-pointer select-none"
									key={obj.order}
								>
									<div
										className="bg-slate-800 h-fit rounded px-2 py-2 cursor-pointer select-none"
										onClick={() => removeWord(obj)}
									>
										<div className="text-2xl text-center">
											{obj.word}
										</div>
										{!hiToEn && (
											<div className="text-center text-xs text-slate-300 select-none">
												{obj?.word_transliterated}
											</div>
										)}
									</div>
									{!hiToEn && (
										<Image
											className="invert h-4 w-4 mx-auto my-2 opacity-30 hover:opacity-100 cursor-pointer"
											src="https://cdn-icons-png.flaticon.com/512/9321/9321839.png"
											width={0}
											height={0}
											alt=""
											onClick={() => copyText(obj.word)}
										/>
									)}
								</div>
							))}
						</div>

						<div className="flex flex-wrap gap-2">
							{options?.map((obj) => (
								<div key={obj.order}>
									<div
										className="bg-slate-800 h-fit rounded px-2 py-2 cursor-pointer select-none"
										onClick={() => chooseWord(obj)}
									>
										<div className="text-2xl text-center">
											{obj.word}
										</div>
										{!hiToEn && (
											<div className="text-center text-xs text-slate-300">
												{obj?.word_transliterated}
											</div>
										)}
									</div>
									{!hiToEn && (
										<Image
											className="invert h-4 w-4 mx-auto my-2 opacity-30 hover:opacity-100 cursor-pointer"
											src="https://cdn-icons-png.flaticon.com/512/9321/9321839.png"
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
				)}

				<div className="flex justify-between mt-32 fixed bottom-0 left-0 p-4 w-full">
					<button className="bg-red-700 p-2 rounded-lg" type="button">Skip</button>
					<button
						className="bg-green-700 p-2 rounded-lg"
						type="submit"
					>
						Check
					</button>
				</div>
			</form>
		</main>
	);
}

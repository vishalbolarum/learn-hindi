import { NextResponse } from "next/server";
import { transliterate } from "transliteration";
import natural from "natural";
import knex from "../_database/knex";

// Reference: https://www.jagranjosh.com/articles/hindi-to-english-sentences-translation-1727443305-1

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		let difficulty = searchParams.get("difficulty");
		let id = searchParams.get("id")

		let task
		if (id) {
			task = await knex("tasks").where({ id }).first()
		} else if (difficulty === "easy" || !difficulty) {
			task = await knex("tasks").where("hi_length", "<", 35).orderByRaw("RANDOM()").first()
		} else if (difficulty === "medium") {
			task = await knex("tasks").where("hi_length", "<", 70).orderByRaw("RANDOM()").first()
		} else if (difficulty === "hard") {
			task = await knex("tasks").where("hi_length", "<", 105).orderByRaw("RANDOM()").first()
		}

		const tokenizer = new natural.AggressiveTokenizer();
		// const prompt = "Generate a simple Hindi sentence and provide its English translation in JSON format like: { \"hi\": \"HINDI SENTENCE\", \"en\": \"ENGLISH TRANSLATION\" }"

		// const response = await openai.chat.completions.create({
		//     model: "gpt-4o-mini",
		//     messages: [{ role: "user", content: prompt }],
		//     temperature: 0.7,
		//     max_tokens: 100,
		// })

		// const aiResponse = response.choices[0].message.content.trim();

		//     // Ensure response is valid JSON
		// const task = JSON.parse(aiResponse?.replace(/```json|```/g, ''));

		const hi_pronunciation = await knex("pronunciation").whereIn("hi", task.hi?.replace(/[।.,?]/g, "")?.split(" ")).select()

		const ideal = {
			...task,
			hi_tokens: task.hi
				?.replace(/[।.,]/g, "")
				?.split(" ")
				.map((token, order) => {
					const target = hi_pronunciation.find(
						(obj) => obj.hi === token?.replace(/[?]/g, "")
					);
					return {
						word: token,
						word_transliterated:
							target?.en_transliteration ||
							transliterate(token)?.toLowerCase(),
						order,
					};
				}),
			en_tokens: tokenizer
				.tokenize(task.en?.toLowerCase())
				.map((token, order) => ({
					word: token,
					word_transliterated: transliterate(token)?.toLowerCase(),
					order,
				})),
		};

		return NextResponse.json(ideal);
	} catch (error) {
		console.error("API Route Error:", error);
		return NextResponse.json(
			{
				error: error.message,
				stack: error.stack,
				location: "API route handler",
			},
			{ status: 500 }
		);
	}
}

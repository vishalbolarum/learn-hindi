import { NextResponse } from "next/server";
import { transliterate } from "transliteration";
import natural from "natural";
import knex from "../_database/knex";

// Reference: https://www.jagranjosh.com/articles/hindi-to-english-sentences-translation-1727443305-1

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		let { id, difficulty, statement_or_question } = Object.fromEntries(searchParams)
		difficulty = difficulty || "medium"

		let task
		let query = knex("sentences").whereNotNull("google_verified").orderByRaw("RANDOM()").first()
			

		if (id) query.where({ id })
		else {
			if (difficulty === "easy") {
				query.where("hi_length", "<", 35)
			} else if (difficulty === "medium") {
				query.where("hi_length", "<", 70)
			} else if (difficulty === "hard") {
				query.where("hi_length", "<", 105)
			}

			if (statement_or_question === "statement") {
				query.whereLike("en", "%.")
			} else if (statement_or_question === "question") {
				query.whereLike("en", "%?")
			}
		}

		

		task = await query

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

		const hi_pronunciation = await knex("words").whereIn("hi", task.hi?.replace(/[।.,?]/g, "")?.replace(/-/g, " ")?.replace(/\s+/g, " ")?.trim()?.split(" ")).select()

		const ideal = {
			...task,
			hi_tokens: task.hi
				?.replace(/[.,]/g, "")
				?.replace(/\s+/g, " ")
				?.trim()
				?.split(" ")
				.map((token, index) => {
					let pronunciation
					let parts = token?.replace(/[।?]/g, "")?.split("-")
					for (const part of parts) {
						const match = hi_pronunciation.find(obj => obj.hi === part)?.en_transliteration
						if (match && !pronunciation) pronunciation = match
						else if (match) pronunciation += `-${match}`
					}
					return {
						word: token,
						word_transliterated:
							pronunciation ||
							transliterate(token)?.toLowerCase(),
						verified_pronunciation: !!pronunciation,
						order: index,
					};
				}),
			en_tokens: tokenizer
				.tokenize(task.en?.toLowerCase())
				.map((token, order) => ({
					word: token?.replace(/-/g, " "),
					order
				})),
		};

		const random_order_hi = Array.from({ length: ideal.hi_tokens.length + 1 }, (_, i) => i).sort(() => Math.random() - 0.5)
		ideal.hi_tokens = ideal.hi_tokens.map((token, index) => ({ ...token, random_order: random_order_hi[index] }))

		const random_order_en = Array.from({ length: ideal.en_tokens.length + 1 }, (_, i) => i).sort(() => Math.random() - 0.5)
		ideal.en_tokens = ideal.en_tokens.map((token, index) => ({ ...token, random_order: random_order_en[index] }))

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

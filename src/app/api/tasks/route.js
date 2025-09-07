import { NextResponse } from "next/server";
import { transliterate } from "transliteration";
import natural from "natural";
import knex from "../_database/knex";

// Reference: https://www.jagranjosh.com/articles/hindi-to-english-sentences-translation-1727443305-1

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		let difficulty = searchParams.get("difficulty") || "medium";
		let id = searchParams.get("id")

		let task
		let query = knex("tasks").whereNotNull("google_verified")
		if (id) {
			task = await query.where({ id }).first()
		} else if (difficulty === "easy") {
			task = await query.where("hi_length", "<", 35).orderByRaw("RANDOM()").first()
		} else if (difficulty === "medium") {
			task = await query.where("hi_length", "<", 70).orderByRaw("RANDOM()").first()
		} else if (difficulty === "hard") {
			task = await query.where("hi_length", "<", 105).orderByRaw("RANDOM()").first()
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

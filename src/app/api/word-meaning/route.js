import { NextResponse } from "next/server";
import {
	TranslateClient,
	TranslateTextCommand,
} from "@aws-sdk/client-translate";
import knex from "../_database/knex";

const translateClient = new TranslateClient({
	region: process.env.NEXT_AWS_REGION,
	credentials: {
		accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
	},
});

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		let word = searchParams.get("word")?.replace(/[।.,?]/g, "")?.trim();
		let source = searchParams.get("source")?.trim()?.toLowerCase();
		let target = searchParams.get("target")?.trim()?.toLowerCase();

		// 1. First check if the definition of the word is already in the database.
		const match = await knex("words").where({ hi: word }).whereNotNull("en").first()
		if (match) {
			return NextResponse.json({
				word,
				word_translated: match.en,
			});
		}

		// 2. If there's nothing found, use Amazon translate.
		const response = await translateClient.send(
			new TranslateTextCommand({
				Text: word,
				SourceLanguageCode: "hi", // e.g., "en"
				TargetLanguageCode: "en", // e.g., "es"
			})
		);

		return NextResponse.json({
			word,
			word_translated:
				response?.TranslatedText?.toLowerCase()?.trim(),
		});
		
	} catch (err) {
		console.log("Environment check:", {
			regionDefined: !!process.env.NEXT_AWS_REGION,
			keyIdDefined: !!process.env.NEXT_AWS_ACCESS_KEY_ID,
			secretDefined: !!process.env.NEXT_AWS_SECRET_ACCESS_KEY,
		});
		return NextResponse.json({
			err: err.toString(),
			env: {
				regionDefined: !!process.env.NEXT_AWS_REGION,
				regionDefinedValue: process.env.NEXT_AWS_REGION,
				keyIdDefined: !!process.env.NEXT_AWS_ACCESS_KEY_ID,
				keyIdDefinedValue: process.env.NEXT_AWS_ACCESS_KEY_ID,
				secretDefined: !!process.env.NEXT_AWS_SECRET_ACCESS_KEY,
				secretDefinedValue: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
			},
		});
	}
}

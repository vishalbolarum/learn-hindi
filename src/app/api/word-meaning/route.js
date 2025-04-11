import { NextResponse } from "next/server";
import axios from "axios";
import pronunciation from "../random/pronunciation.json";
import {
	TranslateClient,
	TranslateTextCommand,
} from "@aws-sdk/client-translate";

const translateClient = new TranslateClient({
	region: process.env.NEXT_AWS_REGION,
	credentials: {
		accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY,
	},
});

// Reference: https://www.jagranjosh.com/articles/hindi-to-english-sentences-translation-1727443305-1

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		let word = searchParams.get("word")?.trim();
		let source = searchParams.get("source")?.trim()?.toLowerCase();
		let target = searchParams.get("target")?.trim()?.toLowerCase();

		const actual = pronunciation.find((p) => p.hi === word)?.en;
		if (actual) {
			return NextResponse.json({
				word,
				word_translated: actual[0],
			});
		} else {
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
		}
	} catch (err) {
		console.log(err.toString());
		return NextResponse.json({
			err: err.toString(),
		});
	}
}

import { NextResponse } from "next/server";
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

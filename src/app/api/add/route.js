import { NextResponse } from "next/server";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import knex from "../_database/knex";

const translateClient = new TranslateClient({
  region: process.env.NEXT_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY
  }
})

// Reference: https://www.jagranjosh.com/articles/hindi-to-english-sentences-translation-1727443305-1

export async function POST(req) {
  const body = await req.json()
  let en = body.en?.trim()
  let category = body.category?.trim() || null
  if (category === "random") category = null
  
  const task = {
    hi: null,
    en,
    category
  };

  try {
    const response = await translateClient.send(new TranslateTextCommand({
      Text: task.en,
      SourceLanguageCode: "en",
      TargetLanguageCode: "hi"
  }))

    task.hi = response?.TranslatedText?.trim()
    task.hi_length = response?.TranslatedText?.trim()?.length
    if (task.hi) {
      await knex("tasks").insert(task).onConflict().ignore()
    }
  } catch (err) {
    console.log(err?.response)
  }
  return NextResponse.json({ task });
}

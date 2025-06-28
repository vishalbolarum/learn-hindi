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
  let id = Number(body?.id) || null
  let hi = body.hi?.trim()
  let en = body.en?.trim()
  
  const task = {
    hi,
    en,
    hi_length: hi.length
  };

  try {
  //   const response = await translateClient.send(new TranslateTextCommand({
  //     Text: task.en,
  //     SourceLanguageCode: "en",
  //     TargetLanguageCode: "hi"
  // }))

  //   task.hi = response?.TranslatedText?.trim()
  //   task.hi_length = response?.TranslatedText?.trim()?.length
    if (task.id) {
      await knex("tasks").where({ id }).update(task)
    } else {
      await knex("tasks").insert(task).onConflict("hi").merge(["en"])
    }
  } catch (err) {
    console.log(err?.response)
  }
  return NextResponse.json({ task });
}

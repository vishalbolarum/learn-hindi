import { NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI();
import fs from "fs/promises";
import axios from "axios";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

const translateClient = new TranslateClient({
  region: process.env.NEXT_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY
  }
})

// Reference: https://www.jagranjosh.com/articles/hindi-to-english-sentences-translation-1727443305-1

export async function POST(req) {
  const formData = await req.formData()
  const en = formData.get("en")?.trim()

  let tasks = await fs
  .readFile("C:/Users/Gaming pc/projects/learn-hindi/src/app/api/add/tasks.json", "utf-8")
  .then((raw) => JSON.parse(raw));

  if (tasks.find((obj) => obj.en === en)) return NextResponse.json({ message: "Duplicate found." });
  

  const task = {
    hi: null,
    en
  };

  try {

    const response = await translateClient.send(new TranslateTextCommand({
      Text: task.en,
      SourceLanguageCode: "en", // e.g., "en"
      TargetLanguageCode: "hi", // e.g., "es"
  }))

    task.hi = response?.TranslatedText?.trim()
  } catch (err) {
    console.log(err?.response)
  }

  
  if (task.hi) {
    tasks.push(task);
    await fs.writeFile("C:/Users/Gaming pc/projects/learn-hindi/src/app/api/add/tasks.json", JSON.stringify(tasks.sort((a, b) => a.hi.length - b.hi.length), null, 2), "utf-8");
  }

  return NextResponse.json({ task });
}

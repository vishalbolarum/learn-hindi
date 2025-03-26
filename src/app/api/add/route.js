import { NextResponse } from "next/server";
import OpenAI from "openai";
const openai = new OpenAI();
import fs from "fs/promises";
import axios from "axios";

// Reference: https://www.jagranjosh.com/articles/hindi-to-english-sentences-translation-1727443305-1

export async function POST(req) {
    const formData = await req.formData()
    const en = formData.get("en")?.trim()

  const task = {
    hi: null,
    en
  };

  try {
    const { data: { translatedText } } = await axios({
        method: "post",
        url: "https://libretranslate.com/translate",
        data: {
          q: en,
          source: "en",
          target: "hi",
          format: "text",
          api_key: process.env.LIBRETRANSLATE,
        },
      })

    task.hi = translatedText
  } catch (err) {
    console.log(err?.response)
  }

  let tasks = await fs
    .readFile("C:/Users/Gaming pc/projects/learn-hindi/src/app/api/add/tasks.json", "utf-8")
    .then((raw) => JSON.parse(raw));
  if (!tasks.find((obj) => obj.en === en) && task.hi) {
    tasks.push(task);
    await fs.writeFile("C:/Users/Gaming pc/projects/learn-hindi/src/app/api/add/tasks.json", JSON.stringify(tasks.sort((a, b) => a.hi.length - b.hi.length), null, 2), "utf-8");
  }

  return NextResponse.json({ task });
}

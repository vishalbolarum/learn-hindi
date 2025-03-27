import { NextResponse } from 'next/server';
import natural from "natural"
import { transliterate } from 'transliteration';
import OpenAI from "openai"
const openai = new OpenAI()
import tasks from "../add/tasks.json"
import pronunciation from "./pronunciation.json"

// Reference: https://www.jagranjosh.com/articles/hindi-to-english-sentences-translation-1727443305-1

export async function GET(req) {

    const { searchParams } = new URL(req.url)
    let difficulty = searchParams.get("difficulty")

    let tasks_in_difficulty
    if (difficulty === "easy" || !difficulty) {
      tasks_in_difficulty = tasks.filter(row => row.hi.length < 30)
    } else if (difficulty === "medium") {
      tasks_in_difficulty = tasks.filter(row => row.hi.length >= 30 && row.hi.length < 60)
    } else if (difficulty === "hard") {
      tasks_in_difficulty = tasks.filter(row => row.hi.length >= 60 && row.hi.length < 90)
    }

    const task = tasks_in_difficulty[Math.floor(Math.random() * tasks_in_difficulty.length)]

    const tokenizer = new natural.AggressiveTokenizer()

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

    const ideal = {
        hi: task.hi,
        hi_tokens: task.hi?.replace(/[।.,]/g, '')?.split(" ").map((token, order) => {
          const target = pronunciation.find(obj => obj.hi === token?.replace(/[?]/g, ''))
          return { word: token, word_transliterated: target?.en_transliteration || transliterate(token)?.toLowerCase(), order }
        }),
        en: task.en,
        en_tokens: tokenizer.tokenize(task.en?.toLowerCase()).map((token, order) => ({ word: token, word_transliterated: transliterate(token)?.toLowerCase(), order }))
    }

  return NextResponse.json({ task: ideal });
}
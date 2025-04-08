import { NextResponse } from "next/server";
import fs from "fs/promises"

// Reference: https://www.jagranjosh.com/articles/hindi-to-english-sentences-translation-1727443305-1

export async function POST(req) {
    const formData = await req.formData()
    const hi = formData.get("hi")?.trim()
    const en_transliteration = formData.get("en_transliteration")?.trim()

    let pronunciation = await fs.readFile("C:/Users/Gaming pc/projects/learn-hindi/src/app/api/random/pronunciation.json", "utf-8").then(raw => JSON.parse(raw))

    if (!pronunciation.find(obj => obj.hi === hi)) {
        pronunciation.push({
            hi,
            en_transliteration
        })
        await fs.writeFile("C:/Users/Gaming pc/projects/learn-hindi/src/app/api/random/pronunciation.json", JSON.stringify(pronunciation.sort((a, b) => a.hi - b.hi), null, 2), "utf-8")
    }
    
    return NextResponse.json({
      hi,
      en_transliteration
    })
}

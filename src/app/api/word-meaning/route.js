import { NextResponse } from "next/server";
import axios from "axios";
import pronunciation from "../random/pronunciation.json";

// Reference: https://www.jagranjosh.com/articles/hindi-to-english-sentences-translation-1727443305-1

export async function GET(req) {
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
    const {
      data: { translatedText },
    } = await axios({
      method: "post",
      url: "https://libretranslate.com/translate",
      data: {
        q: word,
        source,
        target,
        format: "text",
        api_key: process.env.LIBRETRANSLATE,
      },
    });
    return NextResponse.json({
      word,
      word_translated: translatedText?.toLowerCase(),
    });
  }
}

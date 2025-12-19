import { NextResponse } from "next/server"
import knex from "../_database/knex"

export async function POST(req) {
    const body = await req.json()
    let { hi, en_transliteration, ignore } = body
    hi = hi?.trim()
    en_transliteration = en_transliteration?.trim()?.toLowerCase()
    ignore = !!ignore || null
    await knex("words").insert({ hi, en_transliteration, ignore }).onConflict("hi").merge(["ignore"])
    return NextResponse.json({
      hi,
      en_transliteration,
      ignore
    })
}

import { NextResponse } from "next/server"
import knex from "../_database/knex"

export async function POST(req) {
    const body = await req.json()
    let { hi, en_transliteration } = body
    hi = hi?.trim()
    en_transliteration = en_transliteration?.trim()?.toLowerCase()
    await knex("pronunciation").insert({ hi, en_transliteration }).onConflict().ignore()
    return NextResponse.json({
      hi,
      en_transliteration
    })
}

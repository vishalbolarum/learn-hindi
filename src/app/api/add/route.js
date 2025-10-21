import { NextResponse } from "next/server";
import knex from "../_database/knex";

export async function POST(req) {
  const body = await req.json()
  let id = Number(body?.id) || null
  let hi = body.hi?.trim()
  let en = body.en?.trim()
  
  const task = {
    hi,
    en,
    hi_length: hi.length,
    google_verified: true
  };

  try {
    if (id) {
      await knex("sentences").where({ id }).update(task)
    } else {
      await knex("sentences").insert(task).onConflict("hi").merge(["en"])
    }
  } catch (err) {
    console.log(err?.response)
  }
  return NextResponse.json({ task });
}

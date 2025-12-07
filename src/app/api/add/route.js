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
    google_verified: true
  };

  let rows
  try {
    if (id) {
      rows = await knex("sentences").where({ id }).update(task).returning("*")
    } else {
      rows = await knex("sentences").insert(task).onConflict("hi").merge(["en"]).returning("*")
    }
  } catch (err) {
    console.log(err?.response)
  }
  return NextResponse.json({ rows });
}

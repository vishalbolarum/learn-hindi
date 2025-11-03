import { NextResponse } from "next/server";
import knex from "../_database/knex";

export async function GET(req) {
  try {
    let open_session = await knex("logs")
      .where({ user_id: 1 })
      .whereNull("end_time")
      .first();
    open_session = !!open_session;
    return NextResponse.json({ open_session });
  } catch (err) {
    return NextResponse.json({ message: err?.message });
  }
}

export async function POST(req) {
  try {
    let open_session = await knex("logs")
      .where({ user_id: 1 })
      .whereNull("end_time")
      .first();
    open_session = !!open_session;
    if (open_session) throw new Error("An open session already exists!");
    await knex("logs").insert({ user_id: 1 });
    return NextResponse.json({ message: "Done!" });
  } catch (err) {
    return NextResponse.json({ message: err.message });
  }
}

export async function PUT(req) {
  try {
    await knex("logs")
      .where({ user_id: 1 })
      .whereNull("end_time")
      .update({ end_time: new Date() });
  } catch (err) {
    console.log(err?.response);
  }
  return NextResponse.json({ message: "Done!" });
}

import { NextResponse } from "next/server";
import knex from "../_database/knex";

export async function GET(req) {
  try {

    // 1. Calculate the date one month ago.
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // 2. Get total of each day for last 30 days.
    let rows = await knex("logs")
      .where({ user_id: 1 })
      .where("start_time", ">", oneMonthAgo.toISOString())
      .orderBy("start_time", "desc")
      .select();

    const results = []

    for (const row of rows) {
        const duration = new Date(row.end_time) - new Date(row.start_time)

        const match = results.findIndex(result => result.date === new Date(row.start_time)?.toISOString()?.substring(0, 10))
        if (match === -1) {
            results.push({
                date: new Date(row.start_time).toISOString().substring(0, 10),
                duration
            })
        } else {
            results[match].duration += duration
        }
    
    }

    // 3. Get the total of all time.
    const result = await knex("logs")
        .where({ user_id: 1 })
        .sum({
            all_time_total: knex.raw("EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time))")
        })
        .first();

    return NextResponse.json({ logs: results, all_time_total: result.all_time_total * 1000 });
  } catch (err) {
    return NextResponse.json({ message: err?.message });
  }
}
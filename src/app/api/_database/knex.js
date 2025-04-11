import knex from "knex"

const db = knex({
    client: "pg",
    connection: {
      host: process.env.POSTGRESQL_HOST,
      port: process.env.POSTGRESQL_PORT,
      user: process.env.POSTGRESQL_USER,
      password: process.env.POSTGRESQL_PASSWORD,
      database: "postgres",
      ssl: {
        rejectUnauthorized: false
      }
    }
})

db.on("query-response", (response, obj, builder) => {
  if (obj.method === "select") {
    console.log(`[${new Date().toISOString()}] [PostgreSQL] Selected ${obj?.response?.rowCount} rows.`)
  } else if (obj.method === "first") {
    console.log(`[${new Date().toISOString()}] [PostgreSQL] Selected ${obj?.response?.rowCount} rows.`)
  } else if (obj.method === "insert") {
    console.log(`[${new Date().toISOString()}] [PostgreSQL] Inserted ${obj?.response?.rowCount} rows.`)
  } else if (obj.method === "update") {
    console.log(`[${new Date().toISOString()}] [PostgreSQL] Updated ${obj?.response?.rowCount} rows.`)
  } else if (obj.method === "del") {
    console.log(`[${new Date().toISOString()}] [PostgreSQL] Deleted ${obj?.response?.rowCount} rows.`)
  }
})

export default db
import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();

async function initTables() {
  try {
    await client.query(`
      create  table if not exists users(
sid varchar(100) primary key unique not null,
password text not null);

    `);

    await client.query(`
      create  table if not exists employer(
company_id varchar(100) primary key unique not null,
password text not null
);
    `);

    await client.query(`
        create  table if not exists university(
college_id varchar(100) primary key unique not null,
password text not null
);
        `);
    
    const res = await client.query(`
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'public';
`);
console.log("📋 Tables:", res.rows);

    console.log("Tables created successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

initTables();

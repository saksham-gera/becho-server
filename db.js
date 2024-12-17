import pg from "pg"


const db=new pg.Pool({
 user: "",
  host: "",
  database: "",
  password: "",
  port: 5432,
});
export default db;
import util from "node:util"
import mysql from "mysql";

const connection = mysql.createConnection({
  host: process.env.MYSQL_ADDON_HOST,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
});

connection.query = util.promisify(connection.query)
connection.connect = util.promisify(connection.connect)

export default connection;

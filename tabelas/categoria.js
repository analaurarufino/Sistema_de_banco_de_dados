import connection from "./config.js";

export default class Categoria {
  createTable() {
    connection.connect(() => {
      connection.query({
        sql: `CREATE TABLE categoria (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`
      }, (err) => {
        if (err) throw err;

        console.log("Table 'categoria' created");
      });
    });
  }

  inserirCategoria(name) {
    console.log("\nInserindo", name, "na tabela");

    const escaped_name = connection.escape(name)

    connection.connect(() => {
      connection.query({
        sql: `INSERT INTO categoria (name) VALUES (${escaped_name})`
      }, (err, result) => {
        if (err) throw err;

        console.log("\n", result);
      });
    });
  }

  buscarCategoria(name) {
    const escaped_name = connection.escape(name)

    connection.connect(() => {
      connection.query({
        sql: `SELECT * FROM categoria WHERE name = ${escaped_name}`
      }, (err, result) => {
        if (err) throw err;

        console.log(result);
      });
    });
  }
}

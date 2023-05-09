import connection from "./config.js";

export default class Categoria {
  createTable() {
    connection.connect(function () {
      var sql =
        "CREATE TABLE categoria (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))";
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table category created");
      });
    });
    return;
  }
  inserirCategoria(name) {
    console.log("\nInserindo", name, "na tabela");
    connection.connect(function () {
      var sql = `INSERT INTO categoria (name) VALUES ('${name}')`;
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("\n", result);
      });
    });
    return;
  }
  buscarCategoria(name) {
    connection.connect(function () {
      var sql = `INSERT INTO categoria (name) VALUES ('${name}')`;
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result);
      });
    });
  }
}

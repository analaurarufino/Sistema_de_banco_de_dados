import connection from "./connection.js";

export default class Categoria {
  static createTable() {
    const sql = `CREATE TABLE Categorias (
      id_categoria INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255)
    )`;

    return connection
      .query({ sql })
      .then(() => console.log("Table 'Categorias' created"));
  }

  static inserirCategoria(name) {
    console.log(`Inserindo ${name} na tabela`);

    const escaped_name = connection.escape(name);

    return connection
      .query({
        sql: `INSERT INTO Categorias (name) VALUES (${escaped_name})`,
      })
      .then(console.log);
  }

  static buscarCategoria(name) {
    const escaped_name = connection.escape(name);

    return connection
      .query({
        sql: `SELECT * FROM Categorias WHERE name = ${escaped_name}`,
      })
      .then(console.log);
  }

  static listAll() {
    return connection
      .query({
        sql: `SELECT * FROM Categorias`,
      })
      .then(console.log);
  }
}

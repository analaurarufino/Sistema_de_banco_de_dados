import connection from "./connection.js";

export default class Funcionarios {
  static createTable() {
    const sql = `CREATE TABLE Funcionarios (
      funcionario_id INT AUTO_INCREMENT NOT NULL,
      UNIQUE KEY (funcionario_id),
      nome VARCHAR(255) NOT NULL,
      data_nasc VARCHAR(255) NOT NULL,
      cpf VARCHAR(255) NOT NULL UNIQUE,
      cargo VARCHAR(255) NOT NULL,
      tempo_trab INT NOT NULL
    )`;

    return connection
      .query({ sql })
      .then(() => console.log(`Created table 'Funcionario'.`));
  }

  static search(cpf) {
    const escaped_cpf = connection.escape(cpf);

    return connection
      .query({
        sql: `SELECT * FROM Funcionarios WHERE cpf = ${escaped_cpf}`,
      })
      .then(console.log);
  }

  static searchByID(id) {
    const escaped_id = connection.escape(id);

    return connection
      .query({
        sql: `SELECT * FROM Funcionarios WHERE funcionario_id = ${escaped_id}`,
      })
      .then(console.log);
  }

  static listAll() {
    return connection.query({
      sql: `SELECT * FROM Funcionarios`,
    });
  }
}

import connection from "./config.js"

export default class Vendas {
  static createTable() {
    const sql = `CREATE TABLE Vendas (
      venda_id INT AUTO_INCREMENT NOT NULL,
      UNIQUE KEY (venda_id),
      data_venda VARCHAR(255) NOT NULL,
      valor_total VARCHAR(255) NOT NULL,
      cargo VARCHAR(255) NOT NULL,
      cod_venda INT NOT NULL PRIMARY KEY,;
      funcionario_cadastro INT,
      FOREIGN KEY (funcionario_cadastro)
      REFERENCES Funcionarios(id_cadastro)
    )`

    return connection.query({ sql })
      .then(() => console.log(`Created table 'Vendas'.`))
  }

  static search(cod_venda) {
    const escaped_cod = connection.escape(cod_venda)

    return connection.query({
      sql: `SELECT * FROM Vendas WHERE cod_venda = ${escaped_cod}`
    })
      .then(console.log)
  }

  static listAll() {
    return connection.query({
      sql: `SELECT * FROM Vendas`
    })
      .then(console.log)
  }
}

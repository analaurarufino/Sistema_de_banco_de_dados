import connection from "./connection.js";

export default class Vendas {
  static createTable() {
    const sql = `CREATE TABLE Vendas (
  venda_id INT AUTO_INCREMENT NOT NULL,
  data_venda VARCHAR(255) NOT NULL,
  valor_total VARCHAR(255) NOT NULL,
  forma_pagamento VARCHAR(255) NOT NULL,
  status_compra VARCHAR(255) NOT NULL,
  cliente_id INT,
  funcionario_id INT,
  PRIMARY KEY (venda_id),
  FOREIGN KEY (funcionario_id) REFERENCES Funcionarios(funcionario_id),
  FOREIGN KEY (cliente_id) REFERENCES Clientes(id)
);
`;
    return connection
      .query({ sql })
      .then(() => console.log(`Created table 'Vendas'.`));
  }

  static search(cod_venda) {
    const escaped_cod = connection.escape(cod_venda);

    return connection
      .query({
        sql: `SELECT * FROM Vendas WHERE cod_venda = ${escaped_cod}`,
      })
      .then(console.log);
  }

  static listAll() {
    return connection
      .query({
        sql: `SELECT * FROM Vendas`,
      })
      .then(console.log);
  }
}

import connection from "./connection.js";

export default class ProdutoVendas {
  static createTable() {
    const sql = `CREATE TABLE ProdutoVendas(
  id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  cod_produto INT NOT NULL,
  venda_id INT NOT NULL,
  quantidade INT NOT NULL,
  FOREIGN KEY (cod_produto) REFERENCES Produtos(cod_produto),
  FOREIGN KEY (venda_id) REFERENCES Vendas(venda_id)
);`;
    return connection
      .query({ sql })
      .then(() => console.log("Created table 'ProdutoVendas'."));
  }

  static search(cod_venda) {
    const escaped_cod = connection.escape(cod_venda);

    return connection
      .query({
        sql: `SELECT * FROM ProdutoVendas WHERE cod_venda = ${escaped_cod}`,
      })
      .then(console.log);
  }

  static listAll() {
    return connection
      .query({
        sql: `SELECT * FROM ProdutoVendas`,
      })
      .then(console.log);
  }
}

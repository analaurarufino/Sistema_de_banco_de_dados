import connection from "./connection.js";

export default class Produtos {
  static createTable() {
    return connection
      .query({
        sql: `CREATE TABLE Produtos (
        id INT AUTO_INCREMENT NOT NULL,
        UNIQUE KEY (id),
        cod_produto INT NOT NULL,
        nome_produto VARCHAR(255) NOT NULL,
        preco FLOAT NOT NULL,
        categoria VARCHAR(255),
        qtd_estoque INT NOT NULL DEFAULT 0,
        feito_em_Mari BOOL NOT NULL DEFAULT 0,
        PRIMARY KEY (cod_produto)
      );`,
      })
      .then(() => console.log(`table 'Produtos' created.`));
  }

  static search(name) {
    const escaped_name = connection.escape(name);

    return connection.query({
      sql: `SELECT * FROM Produtos WHERE nome_produto = ${escaped_name} LIMIT 1`,
    });
  }

  static listAll() {
    return connection.query({
      sql: "SELECT * FROM Produtos",
    });
  }

  static insert(nome, codigo, categoria, preco, qtdEstoque, feitoEmMari) {
    const nome_sql = connection.escape(nome);
    const categoria_sql = connection.escape(categoria);
    if (feitoEmMari === "Sim") {
      feitoEmMari = 1;
    } else {
      feitoEmMari = 0;
    }
    return connection.query({
      sql: `INSERT INTO Produtos (cod_produto, nome_produto, preco, categoria, qtd_estoque, feito_em_Mari) VALUES (${codigo}, ${nome_sql}, ${preco}, ${categoria_sql}, ${qtdEstoque}, ${feitoEmMari})`,
    });
  }

  static remove(codigo) {
    const escaped_cod = connection.escape(codigo);

    return connection.query({
      sql: `DELETE FROM Produtos WHERE cod_produto = ${escaped_cod}`,
    });
  }
}

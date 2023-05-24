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

  static groupByCategory() {
    return connection.query({
      sql: "SELECT categoria, COUNT(*) AS qtd_produtos FROM Produtos GROUP BY categoria",
    });
  }

  static productMadeInMari() {
    return connection.query({
      sql: "SELECT nome_produto FROM Produtos WHERE feito_em_Mari = 1",
    });
  }

  static insert(nome, codigo, categoria, preco, qtdEstoque, feitoEmMari) {
    if (isNaN(Number(codigo))) {
      throw new Error("'codigo' must be a number");
    }

    if (isNaN(Number(preco))) {
      throw new Error("'preco' must be a number");
    }

    if (isNaN(Number(qtdEstoque))) {
      throw new Error("'qtdEstoque' must be a number");
    }

    const nome_sql = connection.escape(nome);
    const categoria_sql = connection.escape(categoria);

    feitoEmMari = /^S.*/i.test(feitoEmMari) ? 1 : 0;

    return connection.query({
      sql: `INSERT INTO Produtos
      (cod_produto, nome_produto, preco, categoria, qtd_estoque, feito_em_Mari)
      VALUES
      (${codigo}, ${nome_sql}, ${preco}, ${categoria_sql}, ${qtdEstoque}, ${feitoEmMari})`,
    });
  }

  static remove(codigo) {
    const cod_produto = Number(codigo);

    if (isNaN(cod_produto)) {
      throw new Error(`'codigo' must be a number.`);
    }

    return connection.query({
      sql: `DELETE FROM Produtos WHERE cod_produto = ${cod_produto}`,
    });
  }
}

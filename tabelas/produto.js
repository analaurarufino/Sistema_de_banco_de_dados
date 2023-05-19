import connection from "./connection.js"

export default class Produtos {
  static createTable() {
    return connection.query({
      sql: `CREATE TABLE Produtos (
        id INT AUTO_INCREMENT NOT NULL,
        UNIQUE KEY (id),
        name VARCHAR(255) NOT NULL,
        cod_produto INT NOT NULL,
        PRIMARY KEY (cod_produto),
        id_categoria INT,
        FOREIGN KEY (id_categoria)
        REFERENCES Categoria(id_categoria)
      )`
    })
      .then(() => console.log(`table 'Produtos' created.`))
  }

  static search(name) {
    const escaped_name = connection.escape(name)

    return connection.query({
      sql: `SELECT * FROM Produtos WHERE name = ${escaped_name}`
    })
      .then(console.log)
  }

  static listAll() {
    return connection.query({
      sql: "SELECT * FROM Produto"
    })
      .then(console.log)
  }
}

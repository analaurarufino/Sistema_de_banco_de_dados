import connection from "./config"

export default class Produtos {
  createTable() {
    connection.query({
      sql: `CREATE TABLE Produtos (
        id INT AUTO_INCREMENT NOT NULL,
        name VARCHAR(255) NOT NULL,
        cod_produto INT PRIMARY_KEY,
        CONSTRAINT FK_prod_cat FOREIGN KEY (categoria_id)
        REFERENCES categoria(categoria_id)
      )`
    }, (err) => {
      if (err) throw err

      console.log(`table 'Produtos' created.`)
    })
  }

  search(name) {
    const escaped_name = connection.escape(name)

    connection.query({
      sql: `SELECT * FROM Produtos WHERE name = ${escaped_name}`
    }, (err, res) => {
      if (err) throw err

      console.log(res)
    })
  }

  listAll() {
    connection.query({
      sql: "SELECT * FROM Produtos"
    }, (err, res) => {
      if (err) throw err

      console.log(res)
    })
  }
}

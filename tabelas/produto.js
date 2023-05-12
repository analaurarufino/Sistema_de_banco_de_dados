import connection from "./config.js"

export default class Produtos {
  static createTable() {
    return new Promise(res => {
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
        res()
      })
    })
  }

  static search(name) {
    const escaped_name = connection.escape(name)

    return new Promise(res => {
      connection.query({
        sql: `SELECT * FROM Produtos WHERE name = ${escaped_name}`
      }, (err, result) => {
        if (err) throw err

        console.log(result)
        res(result)
      })
    })
  }

  static listAll() {
    return new Promise(res => {
      connection.query({
        sql: "SELECT * FROM Produtos"
      }, (err, result) => {
        if (err) throw err

        console.log(result)
        res(result)
      })
    })
  }
}

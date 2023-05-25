import connection from "./connection.js";

const isString = s => typeof s === 'string' || s instanceof String

const validate_nome = nome_produto => {
  if (nome_produto === undefined)
    return true

  if (nome_produto == null)
    return "nome_produto nao pode ser NULL"

  if (!isString(nome_produto))
    return "nome_produto precisa ser uma string"

  if (nome_produto.length === 0)
    return "nome_produto nao pode ser uma string vazia"

  if (nome_produto.length > 255)
    return "nome_produto precisa ter menos que 255 caracteres"

  return true
}

const validate_codigo = cod_produto => {
  if (cod_produto === undefined)
    return true

  if (cod_produto === null)
    return "cod_produto nao pode ser NULL"

  if (!Number.isInteger(cod_produto))
    return "cod_produto precisa ser um inteiro"

  return true
}

const validate_categoria = categoria => {
  if (categoria === undefined)
    return true

  if (categoria === null)
    return "categoria nao pode ser NULL"

  if (!isString(categoria))
    return "categoria precisa ser uma string"

  if (categoria.length === 0)
    return "categoria nao pode ser uma string vazia"

  if (categoria.length > 255)
    return "categoria precisa ter menos que 255 caracteres"

  return true
}

const validate_preco = preco => {
  if (preco === undefined)
    return true

  if (preco === null)
    return "preco nao pode ser NULL"

  if (isNaN(preco))
    return "preco precisa ser um numero"

  if (preco <= 0)
    return "preco precisa ser maior que zero"

  return true
}

const validate_estoque = qtd_estoque => {
  if (qtd_estoque === undefined)
    return true

  if (qtd_estoque === null)
    return "qtd_estoque nao pode ser NULL"

  if (!Number.isInteger(qtd_estoque))
    return "qtd_estoque precisa ser um inteiro"

  if (qtd_estoque < 0)
    return "qtd_estoque nao pode ser negativo"

  return true
}

const validate_mari = feito_em_Mari => {
  if (feito_em_Mari === undefined)
    return true

  if (feito_em_Mari === null)
    return "feito_em_Mari nao pode ser NULL"

  if (feito_em_Mari !== 0 && feito_em_Mari !== 1)
    return "feito_em_Mari precisa ser ou 0 ou 1"

  return true
}

export default class Produtos {
  static createTable() {
    return connection
      .query({
        sql: `CREATE TABLE Produtos (
          id INT AUTO_INCREMENT NOT NULL,
          UNIQUE KEY (id),
          cod_produto INT NOT NULL,
          PRIMARY KEY (cod_produto),
          nome_produto VARCHAR(255) NOT NULL,
          preco FLOAT NOT NULL,
          categoria VARCHAR(255) NOT NULL,
          qtd_estoque INT NOT NULL DEFAULT 0,
          feito_em_Mari BOOL NOT NULL DEFAULT 0,
        );`,
      })
      .then(() => console.log(`table 'Produtos' created.`))
  }

  static validate({
    nome_produto, cod_produto, categoria, preco, qtd_estoque, feito_em_Mari
  }) {
    const status_nome = validate_nome(nome_produto)
    if (status_nome !== true) return status_nome

    const status_cod = validate_codigo(cod_produto)
    if (status_cod !== true) return status_cod

    const status_categoria = validate_categoria(categoria)
    if (status_categoria !== true) return status_categoria

    const status_preco = validate_preco(preco)
    if (status_preco !== true) return status_preco

    const status_estoque = validate_estoque(qtd_estoque)
    if (status_estoque !== true) return status_estoque

    const status_mari = validate_mari(feito_em_Mari)
    if (status_mari !== true) return status_mari

    return true
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

  static showOne() {
    return connection.query({
      sql: "SELECT * FROM Produtos ORDER BY RAND() LIMIT 1",
    });
  }

  static insert({
    nome_produto, cod_produto, categoria, preco, qtd_estoque, feito_em_Mari
  }) {
    const status = Produtos.validate({
      nome_produto, cod_produto, categoria, preco, qtd_estoque, feito_em_Mari
    })

    if (status !== true)
      throw new Error(status)

    const escaped_nome = connection.escape(nome_produto);
    const escaped_categoria = connection.escape(categoria);

    return connection.query({
      sql: `INSERT INTO Produtos
      (cod_produto, nome_produto, preco, categoria, qtd_estoque, feito_em_Mari)
      VALUES
      (${cod_produto}, ${escaped_nome}, ${preco}, ${escaped_categoria}, ${qtd_estoque}, ${feito_em_Mari})`,
    })
  }

  static alter({
    nome_produto, cod_produto, categoria, preco, qtd_estoque, feito_em_Mari
  }) {
    const status = Produtos.validate({
      nome_produto, cod_produto, categoria, preco, qtd_estoque, feito_em_Mari
    })

    if (status !== true)
      throw new Error(status)

    const to_update = Object.assign({}, {
      nome_produto: connection.escape(nome_produto),
      categoria: connection.escape(categoria),
      preco,
      qtd_estoque,
      feito_em_Mari
    })

    const str = Object.entries(to_update)
      .filter(e => e[1] !== undefined) // only keys with values
      .map(e => `${e[0]}=${e[1]}`) // name=value
      .join(",")

    if (!str.length)
      return

    connection.query({
      sql: `UPDATE Produtos SET ${str} WHERE cod_produto = ${cod_produto}`
    })
  }

  static remove(cod_produto) {
    const status = Produtos.validate({ cod_produto })

    if (status !== true)
      throw new Error(status)

    return connection.query({
      sql: `DELETE FROM Produtos WHERE cod_produto = ${cod_produto}`,
    })
  }

  static get(cod_produto) {
    const status = Produtos.validate({ cod_produto })

    if (status !== true)
      throw new Error(status)

    return connection.query({
      sql: `SELECT * FROM Produtos WHERE cod_produto = ${cod_produto}`
    })
  }
}

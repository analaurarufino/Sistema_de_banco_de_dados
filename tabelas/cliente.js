import connection from "./connection.js";

const isString = (s) => typeof s === "string" || s instanceof String;

const validate_nome = (nome_cliente) => {
  if (nome_cliente === undefined) return true;

  if (nome_cliente == null) return "nome_cliente nao pode ser NULL";

  if (!isString(nome_cliente)) return "nome_cliente precisa ser uma string";

  if (nome_cliente.length === 0)
    return "nome_cliente nao pode ser uma string vazia";

  if (nome_cliente.length > 255)
    return "nome_cliente precisa ter menos que 255 caracteres";

  return true;
};

const validate_fan_de_onepiece = (fan_de_onepiece) => {
  if (fan_de_onepiece === undefined) return true;

  if (fan_de_onepiece === null) return "fan_de_onepiece nao pode ser NULL";

  if (fan_de_onepiece !== 0 && fan_de_onepiece !== 1)
    return "fan_de_onepiece precisa ser ou 0 ou 1";

  return true;
};

const validate_de_souza = (de_souza) => {
  if (de_souza === undefined) return true;

  if (de_souza === null) return "de_souza nao pode ser NULL";

  if (de_souza !== 0 && de_souza !== 1) return "de_souza precisa ser ou 0 ou 1";

  return true;
};

const validate_is_flamengo = (is_flamengo) => {
  if (is_flamengo === undefined) return true;

  if (is_flamengo === null) return "is_flamengo nao pode ser NULL";

  if (is_flamengo !== 0 && is_flamengo !== 1)
    return "is_flamengo precisa ser ou 0 ou 1";

  return true;
};

export default class Clientes {
  static createTable() {
    return connection
      .query({
        sql: `CREATE TABLE Clientes (
          id INT AUTO_INCREMENT NOT NULL,
          UNIQUE KEY (id),
          nome_cliente VARCHAR(255) NOT NULL,
          fan_de_onepiece BOOL NOT NULL DEFAULT 0,
          de_souza BOOL NOT NULL DEFAULT 0,
          is_flamengo BOOL NOT NULL DEFAULT 0
        );`,
      })
      .then(() => console.log(`table 'Clientes' created.`));
  }

  static validate({ nome_cliente, fan_de_onepiece, de_souza, is_flamengo }) {
    const status_nome = validate_nome(nome_cliente);
    if (status_nome !== true) return status_nome;

    const status_fan_onepiece = validate_fan_de_onepiece(fan_de_onepiece);
    if (status_fan_onepiece !== true) return status_fan_onepiece;

    const status_souza = validate_de_souza(de_souza);
    if (status_souza !== true) return status_souza;

    const status_flamengo = validate_is_flamengo(is_flamengo);
    if (status_flamengo !== true) return status_flamengo;

    return true;
  }

  static search(name) {
    const escaped_name = connection.escape(name);

    return connection.query({
      sql: `SELECT * FROM Clientes WHERE nome_cliente = ${escaped_name} LIMIT 1`,
    });
  }

  static listAll() {
    return connection.query({
      sql: "SELECT * FROM Clientes",
    });
  }

  static showOne() {
    return connection.query({
      sql: "SELECT * FROM Clientes ORDER BY RAND() LIMIT 1",
    });
  }

  static insert({ nome_cliente, fan_de_onepiece, de_souza, is_flamengo }) {
    const status = Clientes.validate({
      nome_cliente,
      fan_de_onepiece,
      de_souza,
      is_flamengo,
    });

    if (status !== true) throw new Error(status);

    const escaped_nome = connection.escape(nome_cliente);

    return connection.query({
      sql: `INSERT INTO Clientes
      (nome_cliente, fan_de_onepiece, de_souza, is_flamengo)
      VALUES
      (${escaped_nome}, ${fan_de_onepiece}, ${de_souza}, ${is_flamengo})`,
    });
  }

  static alter({ nome_cliente, fan_de_onepiece, de_souza, is_flamengo }, id) {
    const status = Clientes.validate({
      nome_cliente,
      fan_de_onepiece,
      de_souza,
      is_flamengo,
    });

    if (status !== true) throw new Error(status);

    const to_update = Object.assign(
      {},
      {
        nome_cliente: nome_cliente
          ? connection.escape(nome_cliente)
          : undefined,
        fan_de_onepiece,
        de_souza,
        is_flamengo,
      }
    );

    const str = Object.entries(to_update)
      .filter((e) => e[1] !== undefined) // only keys with values
      .map((e) => `${e[0]}=${e[1]}`) // name=value
      .join(",");

    if (!str.length) return;

    connection.query({
      sql: `UPDATE Clientes SET ${str} WHERE id = ${id}`,
    });
  }

  static remove(id) {
    const status = Clientes.validate({ id });

    if (status !== true) throw new Error(status);

    return connection.query({
      sql: `DELETE FROM Clientes WHERE id = ${id}`,
    });
  }

  static get(id) {
    const status = Clientes.validate({ id });

    if (status !== true) throw new Error(status);

    return connection.query({
      sql: `SELECT * FROM Clientes WHERE id = ${id}`,
    });
  }

  static groupByCategory() {
    return connection.query({
      sql: `SELECT categoria, COUNT(*) AS qtd_produtos
      FROM Clientes
      GROUP BY categoria`,
    });
  }

  static productMadeInMari() {
    return connection.query({
      sql: `SELECT *
      FROM Clientes
      WHERE feito_em_Mari = 1`,
    });
  }
}

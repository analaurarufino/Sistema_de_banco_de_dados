import connection from "./connection.js";

const isString = (s) => typeof s === "string" || s instanceof String;

const validate_nome = (nome) => {
  if (nome === undefined) return true;

  if (nome === null) return "nome não pode ser NULL";

  if (!isString(nome)) return "nome precisa ser uma string";

  if (nome.length === 0) return "nome não pode ser uma string vazia";

  if (nome.length > 255) return "nome nao pode exceder 255 caracteres";

  return true;
};

const validate_data = (data_nasc) => {
  if (data_nasc === undefined) return true;

  if (data_nasc === null) return "data_nasc não pode ser NULL";

  if (!isString(data_nasc)) return "data_nasc precisa ser uma string";

  if (data_nasc.length === 0) return "data_nasc não pode ser uma string vazia";

  if (data_nasc.length > 255)
    return "data_nasc nao pode exceder 255 caracteres";

  return true;
};

const validate_cpf = (cpf) => {
  if (cpf === undefined) return true;

  if (cpf === null) return "cpf não pode ser NULL";

  if (!isString(cpf)) return "cpf precisa ser uma string";

  if (cpf.length === 0) return "cpf não pode ser uma string vazia";

  if (cpf.length > 255) return "cpf nao pode exceder 255 caracteres";

  return true;
};

const validate_cargo = (cargo) => {
  if (cargo === undefined) return true;

  if (cargo === null) return "cargo não pode ser NULL";

  if (!isString(cargo)) return "cargo precisa ser uma string";

  if (cargo.length === 0) return "cargo não pode ser uma string vazia";

  if (cargo.length > 255) return "cargo nao pode exceder 255 caracteres";

  return true;
};

const validate_senha = (senha) => {
  if (senha === undefined) return true;

  if (senha === null) return "senha não pode ser NULL";

  if (!isString(senha)) return "senha precisa ser uma string";

  if (senha.length === 0) return "senha não pode ser uma string vazia";

  if (senha.length > 255) return "senha nao pode exceder 255 caracteres";

  return true;
};

const validate_tempo_trab = (tempo_trab) => {
  if (tempo_trab === undefined) return true;

  if (tempo_trab === null) return "tempo_trab nao pode ser NULL";

  if (isNaN(tempo_trab)) return "tempo_trab precisa ser um numero";

  if (tempo_trab <= 0) return "tempo_trab nao pode ser menor ou igual a zero";

  return true;
};

export default class Funcionarios {
  static createTable() {
    const sql = `CREATE TABLE Funcionarios (
      funcionario_id INT AUTO_INCREMENT NOT NULL,
      UNIQUE KEY (funcionario_id),
      nome VARCHAR(255) NOT NULL,
      data_nasc VARCHAR(255) NOT NULL,
      cpf VARCHAR(255) NOT NULL UNIQUE,
      cargo VARCHAR(255) NOT NULL,
      senha VARCHAR(255) NOT NULL,
      tempo_trab INT NOT NULL
    )`;

    return connection
      .query({ sql })
      .then(() => console.log(`Created table 'Funcionario'.`));
  }

  static search(cpf) {
    const escaped_cpf = connection.escape(cpf);

    return connection.query({
      sql: `SELECT * FROM Funcionarios WHERE cpf = ${escaped_cpf}`,
    });
  }

  static searchByID(id) {
    const escaped_id = connection.escape(id);

    return connection.query({
      sql: `SELECT * FROM Funcionarios WHERE funcionario_id = ${escaped_id}`,
    });
  }

  static listAll() {
    return connection.query({
      sql: `SELECT * FROM Funcionarios`,
    });
  }
}

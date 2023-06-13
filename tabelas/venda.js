import connection from "./connection.js";
import Funcionarios from "./funcionario.js";

const isString = (s) => typeof s === "string" || s instanceof String;

const validate_date = (data_venda) => {
  if (data_venda === undefined) return true;

  if (data_venda == null) return "data_venda nao pode ser NULL";

  if (!isString(data_venda)) return "data_venda precisa ser uma string";

  if (data_venda.length === 0)
    return "data_venda nao pode ser uma string vazia";

  if (data_venda.length > 255)
    return "data_venda precisa ter menos que 255 caracteres";

  return true;
};

const validate_value = (valor_total) => {
  if (valor_total === undefined) return true;

  if (valor_total == null) return "valor_total nao pode ser NULL";

  if (isNaN(Number(valor_total))) return "valor_total precisa ser um numero";

  if (valor_total.length === 0)
    return "valor_total nao pode ser uma string vazia";

  if (valor_total.length > 255)
    return "valor_total precisa ter menos que 255 caracteres";

  return true;
};

const validate_payment = (forma_pagamento) => {
  if (forma_pagamento === undefined) return true;

  if (forma_pagamento == null) return "forma_pagamento nao pode ser NULL";

  if (!isString(forma_pagamento))
    return "forma_pagamento precisa ser uma string";

  if (forma_pagamento.length === 0)
    return "forma_pagamento nao pode ser uma string vazia";

  if (forma_pagamento.length > 255)
    return "forma_pagamento precisa ter menos que 255 caracteres";

  return true;
};

const validate_status = (status_compra) => {
  if (status_compra === undefined) return true;

  if (status_compra == null) return "status_compra nao pode ser NULL";

  if (!isString(status_compra)) return "status_compra precisa ser uma string";

  if (status_compra.length === 0)
    return "status_compra nao pode ser uma string vazia";

  if (status_compra.length > 255)
    return "status_compra precisa ter menos que 255 caracteres";

  return true;
};

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

  static validate({ date_venda, valor_total, forma_pagamento, status_compra }) {
    const status_date = validate_date(date_venda);
    if (status_date !== true) return status_date;

    const status_value = validate_value(valor_total);
    if (status_value !== true) return status_value;

    const status_payment = validate_payment(forma_pagamento);
    if (status_payment !== true) return status_payment;

    const status_status = validate_status(status_compra);
    if (status_status !== true) return status_status;

    return true;
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

  static createSale({
    date_venda,
    valor_total,
    forma_pagamento,
    status_compra,
    cliente_id,
    funcionario_id,
  }) {
    const status = Vendas.validate({
      date_venda,
      valor_total,
      forma_pagamento,
      status_compra,
    });

    if (status !== true) throw new Error(status);

    const escaped_date = connection.escape(date_venda);
    const escaped_value = connection.escape(valor_total);
    const escaped_payment = connection.escape(forma_pagamento);
    const escaped_status = connection.escape(status_compra);

    return connection.query({
      sql: `INSERT INTO Vendas
      (data_venda, valor_total, forma_pagamento, status_compra, cliente_id, funcionario_id)
      VALUES
      (${escaped_date}, ${escaped_value}, ${escaped_payment}, ${escaped_status}, ${cliente_id}, ${funcionario_id})`,
    });
  }

  static salesByClient(cliente_id) {
    return connection.query({
      sql: `SELECT * FROM Vendas WHERE cliente_id = ${cliente_id};`,
    });
  }
}

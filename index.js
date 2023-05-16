import readline from "node:readline";
import 'dotenv/config'

import {
  connection, Categoria, Produtos,
  Funcionarios, Vendas, ProdutoVendas
} from "./tabelas/index.js"

class ControllDB {
  connect() {
    connection.connect();
  }

  disconnect() {
    connection.end();
  }
}

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const run = new ControllDB();

run.connect();

const legenda = { 0: "desconectar", 1: "inserir item na categoria" };

async function init() {
  console.log(1)
  await Categoria.listAll()
  await Produtos.listAll()
  console.log(2)
  run.disconnect();
  process.exit(0);

  terminal.question(
    `Ola, selecione uma das funções abaixo para continuar \n0: ${legenda[0]}\n1: ${legenda[1]}\n`,
    answer => {
      switch (answer) {
        case "0":
          console.log("logout");
          run.disconnect();
          process.exit(0);

        case "1":
          terminal.question(
            `\nDigite o nome da categoria:`,
            async answer2 => {
              await Categoria.inserirCategoria(answer2);
              run.disconnect();
              terminal.close();
              process.exit(0)
            }
          );
          break;
      }
    }
  );
}

init();

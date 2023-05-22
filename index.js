import readline from "node:readline";
import util from "node:util";
import "dotenv/config";

import {
  connection,
  Categoria,
  Produtos,
  Funcionarios,
  Vendas,
  ProdutoVendas,
} from "./tabelas/index.js";

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

terminal.questionp = util.promisify(terminal.question);

const run = new ControllDB();

run.connect();

const legenda = {
  0: "desconectar",
  1: "Lista todos os produtos",
  2: "Pesquisar por nome:",
  3: "Inserir Produto:",
  4: "Remover Produto:",
};

async function init() {
  // console.log(1)
  // await Categoria.listAll()
  // await Produtos.listAll()
  // console.log(2)
  // run.disconnect();
  // process.exit(0);

  terminal.question(
    `Ola, selecione uma das funções abaixo para continuar \n0: ${legenda[0]}\n1: ${legenda[1]}\n2: ${legenda[2]}\n3: ${legenda[3]}\n4: ${legenda[4]}\n`,
    async (answer) => {
      switch (answer) {
        case "0":
          console.log("logout");
          run.disconnect();
          process.exit(0);

        case "1": {
          const resultado = await Produtos.listAll();
          console.log(resultado["0"]);
          run.disconnect();
          terminal.close();
          process.exit(0);
        }
        case "2": {
          const answer = await terminal.questionp(
            "Digite o nome do produto desejado: "
          );
          const resultado = await Produtos.search(answer);
          console.log(resultado["0"]);
          run.disconnect();
          terminal.close();
          process.exit(0);
        }

        case "3": {
          const nome = await terminal.questionp(
            "Digite o nome do seu produto: "
          );

          const codigo = await terminal.questionp(
            "Digite o codigo do seu produto: "
          );

          const categoria = await terminal.questionp(
            "Digite a categoria do seu produto: "
          );
          const preco = await terminal.questionp(
            "Digite o preço do seu produto: "
          );

          const qtdEstoque = await terminal.questionp(
            "Digite a quantitade presente no estoque: "
          );

          const mari = await terminal.questionp("Foi feito em Mari? Sim/Não");

          const resultado = await Produtos.insert(
            nome,
            codigo,
            categoria,
            preco,
            qtdEstoque,
            mari
          );
          console.log(resultado["0"]);
          run.disconnect();
          terminal.close();
          process.exit(0);
        }

        case "4": {
          const answer = await terminal.questionp(
            "Digite o código do produto a ser removido: "
          );
          const resultado = await Produtos.remove(answer);
          console.log(resultado["0"]);
          run.disconnect();
          terminal.close();
          process.exit(0);
        }
      }
    }
  );
}

init();

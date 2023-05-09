import connection from "./tabelas/config.js";
import Categoria from "./tabelas/categoria.js";
import readline from "readline";

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
const categoria = new Categoria();

run.connect();

//#### COMANDOS PARA CRIAR TABELAS ####
// categoria.createTable();

const legenda = { 0: "desconectar", 1: "inserir item na categoria" };
function init() {
  terminal.question(
    `Ola, selecione uma das funções abaixo para continuar \n0: ${legenda[0]}\n1: ${legenda[1]}\n`,
    function (answer) {
      switch (answer) {
        case "0":
          console.log("logout");
          run.disconnect();
          process.exit();

        case "1":
          terminal.question(
            `\nDigite o nome da categoria:`,
            function (answer2) {
              categoria.inserirCategoria(answer2);
              terminal.close();
            }
          );
          break;
      }
    }
  );
}

init();

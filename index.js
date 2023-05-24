import "dotenv/config";
import readline from "node:readline/promises"

import {
  connection,
  Produtos,
} from "./tabelas/index.js"

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const legenda = {
  0: "desconectar",
  1: "Lista todos os produtos",
  2: "Pesquisar por nome:",
  3: "Inserir Produto:",
  4: "Remover Produto:",
}

const init = async () => {
  await connection.connect()

  while (1) {
    const func = await terminal.question(
      `Ola, selecione uma das funções abaixo para continuar\n` +
      `0: ${legenda[0]}\n` +
      `1: ${legenda[1]}\n` +
      `2: ${legenda[2]}\n` +
      `3: ${legenda[3]}\n` +
      `4: ${legenda[4]}\n`
    )

    let end = false

    switch (func) {
    case "0":
      console.log("logout")
      end = true
      break

    case "1": {
      const resultado = await Produtos.listAll()

      console.table(resultado)

      break
    }
    case "2": {
      const answer = await terminal.question("Digite o nome do produto desejado: ")

      const resultado = await Produtos.search(answer)
      console.table(resultado["0"])

      break
    }

    case "3": {
      const nome = await terminal.question("Digite o nome do seu produto: ")

      const codigo = await terminal.question("Digite o codigo do seu produto: ")

      const categoria = await terminal.question("Digite a categoria do seu produto: ")

      const preco = await terminal.question("Digite o preço do seu produto: ")

      const qtdEstoque = await terminal.question("Digite a quantitade presente no estoque: ")

      const mari = await terminal.question("Foi feito em Mari? (S/N) ")

      let obj = {
        nome,
        codigo,
        categoria,
        preco,
        qtdEstoque,
        mari
      }

      console.table([obj])

      await Produtos.insert(
        nome,
        codigo,
        categoria,
        preco,
        qtdEstoque,
        mari
      )

      console.log("inserido.")
      break
    }

    case "4": {
      const answer = await terminal.question("Digite o código do produto a ser removido: ")
      await Produtos.remove(answer)
      break
    }

    default:
      break
    }

    if (end) break
  }

  connection.end()
  terminal.close()
}

init()

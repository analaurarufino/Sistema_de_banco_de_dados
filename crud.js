import 'dotenv/config'

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import {
  connection,
  Categoria,
} from "./tabelas/index.js"

const inserir = async (rl) => {
  const raw_answer = await rl.question(
    `[Insercao Marota]\n` +
    `Escolha a tabela:\n` +
    `1. Categoria\n` +
    `2. Funcionario\n` +
    `3. Produto\n` +
    `4. Venda\n` +
    `\n>> `
  )

  const answer = Number(raw_answer)

  if (isNaN(answer)) {
    console.log("burro")
    return
  }

  switch (answer) {
  case 1: {
    const nome_categoria = await rl.question(
      `Insira o nome da nova categoria: `
    )

    return Categoria.inserirCategoria(nome_categoria)
  }
  case 2:
    break
  case 3:
    break
  case 4:
    break

  default:
    console.log("burro")
  }
}

const alterar = async rl => {
  const raw_answer = await rl.question(
    `[Alterar (sem where kkkkk)]\n` +
    `Escolha a tabela:\n` +
    `1. Categoria\n` +
    `2. Funcionario\n` +
    `3. Produto\n` +
    `4. Venda\n` +
    `\n>> `
  )

  const answer = Number(raw_answer)

  if (isNaN(answer)) {
    console.log("burro")
    return
  }

  switch (answer) {
    case 1: {
      // return Categoria.alterar()
    }
    case 2:
      break
    case 3:
      break
    case 4:
      break

    default:
      console.log("burro")
  }
}

const listAll = async (rl) => {
  const raw_answer = await rl.question(
    `[Listar Tudo e Todos]\n` +
    `Escolha a tabela:\n` +
    `1. Categoria\n` +
    `2. Funcionario\n` +
    `3. Produto\n` +
    `4. Venda\n` +
    `\n>> `
  )

  const answer = Number(raw_answer)

  if (isNaN(answer)) {
    console.log("burro")
    return
  }

  switch (answer) {
    case 1: {
      return Categoria.listAll()
    }
    case 2:
      break
    case 3:
      break
    case 4:
      break

    default:
      console.log("burro")
  }
}

const crud = async () => {
  const rl = readline.createInterface({ input, output });

  if (connection.state != "connected") {
    console.log("connecting to db...")
    await connection.connect()
    console.log("connected!")
  }

  while (1) {
    const raw_answer = await rl.question(
      `[CRUDZAO MAROTO]\n` +
      `1. Inserir\n` +
      `2. Alterar\n` +
      `3. Pesquisar por nome\n` +
      `4. Remover\n` +
      `5. Listar todos\n` +
      `6. Exibir um\n` +
      `7. Desconectar\n` +
      `\n>> `
    )

    const answer = Number(raw_answer)

    if (isNaN(answer)) {
      console.log("burro")
      break
    }

    let stop = false
    switch (answer) {
    case 1:
      await inserir(rl)
      break
    case 2:
      break
    case 3:
      break
    case 4:
      break
    case 5:
      await listAll(rl)
      break
    case 6:
      break
    case 7:
      console.log("Desconectando...")
      stop = true
      break

    default:
      break
    }

    if (stop) break
  }

  connection.end()
  rl.close()
}

export default crud

crud()

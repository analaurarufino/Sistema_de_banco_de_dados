import "dotenv/config";
import inquirer from "inquirer";

import {
  connection,
  Produtos,
} from "./tabelas/index.js"

const categorias = [
  { name: "Frutas", value: "frutas" },
  { name: "Legumes", value: "legumes" },
  { name: "Carnes", value: "carnes" },
  { name: "Bebidas", value: "bebidas" },
  { name: "Limpeza", value: "limpeza" },
  { name: "Laticínios", value: "laticinios" },
  { name: "Padaria", value: "padaria" },
  { name: "Higiene Pessoal", value: "higiene_pessoal" },
  { name: "Eletrônicos", value: "eletronicos" },
  { name: "Congelados", value: "congelados" },
  { name: "Grãos e Cereais", value: "graos_e_cereais" },
  { name: "Bebidas Alcoólicas", value: "bebidas_alcoolicas" },
  { name: "Cuidados com Animais", value: "cuidados_com_animais" },
  { name: "Pães", value: "paes" },
  { name: "Açougue", value: "acougue" },
  { name: "Hortaliças", value: "hortalicas" },
  { name: "Doces e Sobremesas", value: "doces_e_sobremesas" },
  { name: "Artigos de Casa", value: "artigos_de_casa" },
  { name: "Produtos de Limpeza", value: "produtos_de_limpeza" },
  { name: "Cereais Matinais", value: "cereais_matinais" },
  { name: "Bebidas Quentes", value: "bebidas_quentes" },
  { name: "Utensílios de Cozinha", value: "utensilios_de_cozinha" },
  { name: "Produtos de Beleza", value: "produtos_de_beleza" },
]

const init = async () => {
  await connection.connect()

  while (1) {
    const func = await inquirer.prompt([{
      type: "list",
      name: "selected_function",
      message: "Selecione uma das funções abaixo para continuar:",
      choices: [
        { name: "Desconectar", value: 0 },
        { name: "Listar todos produtos", value: 1 },
        { name: "Pesquisar produto por nome", value: 2 },
        { name: "Inserir produto", value: 3 },
        { name: "Remover produto", value: 4 },
        { name: "Alterar produto", value: 5 },
      ]
    }])
      .then(answers => answers.selected_function)


    if (func === 0) break

    switch (func) {
    case 1: {
      try {
        const result = await Produtos.listAll()

        console.table(result)
      } catch (e) {
        console.error("[Erro] Listar", e)
      }

      break
    }
    case 2: {
      const prod_name = await inquirer.prompt({
        name: "prod_name",
        message: "Digite o nome do produto desejado:",
        type: "input"
      })
        .then(answer => answer.prod_name)

      try {
        const resultado = await Produtos.search(prod_name)

        console.table([resultado["0"]])
      } catch (e) {
        console.error("[Erro] Pesquisar", e)
      }


      break
    }

    case 3: {
      const nome_produto = await inquirer.prompt({
        name: "nome_produto",
        message: "Digite o nome do seu produto:",
        type: "input",
        validate: (nome_produto) => {
          const status = Produtos.validate({ nome_produto })

          if (status !== true)
            return status

          return true
        }
      })
        .then(answer => answer.nome_produto)

      const cod_produto = await inquirer.prompt({
        name: "cod_produto",
        message: "Digite o codigo do seu produto:",
        type: "number",
        validate: (cod_produto) => new Promise(async res => {
          const status_cod = Produtos.validate({ cod_produto })

          if (status_cod !== true)
            return res(status_cod)

          const resp = await Produtos.get(cod_produto)

          if (resp.length)
            return res("Esse codigo de produto ja esta sendo usado")

          return res(true)
        })
      })
        .then(answer => answer.cod_produto)

      const categoria = await inquirer.prompt({
        name: "categoria",
        message: "Digite a categoria do seu produto:",
        type: "list",
        choices: categorias,
        loop: false,
      })
        .then(answer => answer.categoria)

      const preco = await inquirer.prompt({
        name: "preco",
        message: "Digite o preço do seu produto:",
        type: "number",
        validate: preco => {
          const status_preco = Produtos.validate({ preco })

          if (status_preco !== true)
            return status_preco

          return true
        }
      })
        .then(answer => answer.preco)

      const qtd_estoque = await inquirer.prompt({
        name: "qtd_estoque",
        message: "Digite a quantitade presente no estoque:",
        type: "number",
        validate: (qtd_estoque) => {
          const status_estoque = Produtos.validate({ qtd_estoque })

          if (status_estoque !== true)
            return status_estoque

          return true
        }
      })
        .then(answer => answer.qtd_estoque)

      const feito_em_Mari = await inquirer.prompt({
        name: "feito_em_Mari",
        message: "Foi feito em Mari?",
        type: "confirm"
      })
        // convert bool to int
        .then(answer => ~~answer.feito_em_Mari)

      let to_insert = {
        nome_produto,
        cod_produto,
        categoria,
        preco,
        qtd_estoque,
        feito_em_Mari
      }

      console.table([to_insert])

      try {
        await Produtos.insert(to_insert)

        console.log("inserido.")
      } catch (e) {
        console.error("[Erro] Inserir", e)
      }

      break
    }

    case 4: {
      const codigo_produto = await inquirer.prompt({
        name: "codigo_produto",
        message: "Digite o código do produto a ser removido:",
        type: "number",
        validate: (codigo_produto) => {
          const status = Produtos.validate({ codigo_produto })

          if (status !== true)
            return status

          return true
        },
      })
        .then(answer => answer.codigo_produto)

      try {
        const result = await Produtos.remove(codigo_produto)

        if (result.affectedRows === 1)
          console.log("Produto removido")
        else
          console.log("Produto nao encontrado")
      } catch (e) {
        console.error("[Erro] Remover", e)
      }

      break
    }

    case 5: {
      const cod_produto = await inquirer.prompt({
        name: "cod_produto",
        message: "Digite o codigo do produto que você quer alterar:",
        type: "number",
        validate: cod_produto => new Promise(async res => {
          const status = Produtos.validate({ cod_produto })

          if (status !== true)
            return res(status)

          const resp = await Produtos.get(cod_produto)

          if (!resp.length)
            return res("nao ha nenhum produto com esse codigo")

          return res(true)
        })
      })
        .then(answer => answer.cod_produto)

      const resp = await Produtos.get(cod_produto)

      console.table(resp)

      const to_alter = {}

      const nome_produto = await inquirer.prompt([
        {
          name: "decision",
          message: "Deseja alterar o nome do produto?",
          type: "confirm",
        }, {
          name: "nome_produto",
          message: "Insira o novo nome do produto:",
          type: "input",
          when: a => {
            return a.decision
          },
          validate: nome_produto => {
            const status = Produtos.validate({ nome_produto })

            return status !== true ? status : true
          }
        }
      ])
        .then(answers => answers.nome_produto)

      to_alter.nome_produto = nome_produto

      const categoria = await inquirer.prompt([
        {
          name: "decision",
          message: "Deseja alterar a categoria do produto?",
          type: "confirm",
        },
        {
          name: "categoria",
          message: "Escolha a nova categoria do produto:",
          type: "list",
          choices: categorias,
          when: a => a.decision,
        }
      ])
        .then(answers => answers.categoria)

      to_alter.categoria = categoria

      const preco = await inquirer.prompt([
        {
          name: "decision",
          message: "Deseja alterar o preco do produto?",
          type: "confirm"
        },
        {
          name: "preco",
          message: "Insira o novo preco do produto:",
          type: "number",
          when: a => a.decision,
          validate: preco => {
            const status = Produtos.validate({ preco })

            return status !== true ? status : true
          },
        }
      ])
        .then(answers => answers.preco)

      to_alter.preco = preco

      const qtd_estoque = await inquirer.prompt([
        {
          name: "decision",
          message: "Deseja alterar a quantidade em estoque?",
          type: "confirm"
        },
        {
          name: "qtd_estoque",
          message: "Insira a nova quantidade em estoque:",
          type: "number",
          when: a => a.decision,
          validate: qtd_estoque => {
            const status = Produtos.validate({ qtd_estoque })

            return status !== true ? status : true
          },
        }
      ])
        .then(answers => answers.qtd_estoque)

      to_alter.qtd_estoque = qtd_estoque

      const feito_em_Mari = await inquirer.prompt([
        {
          name: "decision",
          message: "Deseja alterar se o produto foi feito em Mari?",
          type: "confirm"
        }
      ])
        .then(answers => {
          const to_negate = answers.decision

          const original = resp['0'].feito_em_Mari

          return ~~(to_negate ? !original : original)
        })

      to_alter.feito_em_Mari = feito_em_Mari

      try {
        await Produtos.alter(Object.assign({ cod_produto }, to_alter))
      } catch (e) {
        console.error("[Erro] Alterar", e)
      }

      const altered = await Produtos.get(cod_produto)

      console.table(altered)
    }

    default:
      break
    }
  }

  connection.end()
}

init()

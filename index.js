import "dotenv/config";
import inquirer from "inquirer";

import {
  connection,
  Produtos,
} from "./tabelas/index.js"

class Crud {
  constructor (connection) {
    this.connection = connection

    this.categorias = [
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

    this.constants = {
      DISCONNECT: 0,
      LIST_ALL: 1,
      SEARCH_NAME: 2,
      INSERT: 3,
      DELETE: 4,
      ALTER: 5,
      SHOW_ONE: 6,
      GROUP_CATEGORY: 7,
      GROUP_MARI: 8,
    }
  }

  async connect() {
    return this.connection.connect()
  }

  async disconnect() {
    return this.connection.end()
  }

  async list_all_products() {
    try {
      const result = await Produtos.listAll()

      console.table(result)
    } catch (e) {
      console.error("[Erro] Listar", e)
    }
  }

  async search_product_name() {
    const prod_name = await inquirer.prompt({
      name: "prod_name",
      message: "Digite o nome do produto desejado:",
      type: "input",
      validate: nome_produto => {
        return Produtos.validate({ nome_produto })
      }
    })
      .then(answer => answer.prod_name)

    try {
      const resultado = await Produtos.search(prod_name)

      if (resultado.length == 0)
        console.log("Nenhum produto foi encontrado.")
      else
        console.table(resultado)
    } catch (e) {
      console.error("[Erro] Pesquisar", e)
    }
  }

  async insert_product() {
    const nome_produto = await inquirer.prompt({
      name: "nome_produto",
      message: "Digite o nome do seu produto:",
      type: "input",
      validate: (nome_produto) => {
        return Produtos.validate({ nome_produto })
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
      choices: this.categorias,
      loop: false,
    })
      .then(answer => answer.categoria)

    const preco = await inquirer.prompt({
      name: "preco",
      message: "Digite o preço do seu produto:",
      type: "number",
      validate: preco => {
        return Produtos.validate({ preco })
      }
    })
      .then(answer => answer.preco)

    const qtd_estoque = await inquirer.prompt({
      name: "qtd_estoque",
      message: "Digite a quantitade presente no estoque:",
      type: "number",
      validate: (qtd_estoque) => {
        return Produtos.validate({ qtd_estoque })
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

    try {
      await Produtos.insert(to_insert)

      console.table([to_insert])

      console.log("inserido.")
    } catch (e) {
      console.error("[Erro] Inserir", e)
    }
  }

  async delete_product() {
    const codigo_produto = await inquirer.prompt({
      name: "codigo_produto",
      message: "Digite o código do produto a ser removido:",
      type: "number",
      validate: (codigo_produto) => {
        return Produtos.validate({ codigo_produto })
      },
    })
      .then(answer => answer.codigo_produto)

    try {
      const result = await Produtos.remove(codigo_produto)

      if (result.affectedRows === 1)
        console.log("Produto removido.")
      else
        console.log("Produto nao encontrado.")
    } catch (e) {
      console.error("[Erro] Remover", e)
    }
  }

  async alter_product() {
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
          return res("Nao ha nenhum produto com esse codigo.")

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
          return Produtos.validate({ nome_produto })
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
        choices: this.categorias,
        when: a => a.decision,
        loop: false,
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
          return Produtos.validate({ preco })
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
          return Produtos.validate({ qtd_estoque })
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

        // nega o original (se foi indicado) e converte pra inteiro com ~~
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

  async show_product() {
    try {
      const resp = await Produtos.showOne()

      console.table(resp)
    } catch (e) {
      console.error("[Erro] Exibir produto", e)
    }
  }

  async show_product_group_category() {
    try {
      const results = await Produtos.groupByCategory()

      console.table(results)
    } catch (e) {
      console.error("[Erro] Exibir por categoria")
    }
  }

  async show_product_group_mari() {
    try {
      const results = await Produtos.productMadeInMari()

      console.table(results)
    } catch (e) {
      console.error("[Erro] Exibir feitos em Mari")
    }
  }

  async ask() {
    const choice = await inquirer.prompt([{
      type: "list",
      name: "choice",
      message: "Selecione uma das funções abaixo para continuar:",
      choices: [
        { name: "Desconectar", value: this.constants.DISCONNECT },
        { name: "Listar todos produtos", value: this.constants.LIST_ALL },
        { name: "Pesquisar produto por nome", value: this.constants.SEARCH_NAME },
        { name: "Inserir produto", value: this.constants.INSERT },
        { name: "Remover produto", value: this.constants.DELETE },
        { name: "Alterar produto", value: this.constants.ALTER },
        { name: "Exibir um produto", value: this.constants.SHOW_ONE },
        { name: "Exibir produtos por categoria", value: this.constants.GROUP_CATEGORY },
        { name: "Exibir produtos feitos em Mari", value: this.constants.GROUP_MARI },
      ],
      loop: false,
    }])
      .then(answers => answers.choice)

    if (choice === this.constants.DISCONNECT)
      return 0 // signals to stop

    switch (choice) {
    case this.constants.LIST_ALL:
      await this.list_all_products()
      break
    case this.constants.SEARCH_NAME:
      await this.search_product_name()
      break
    case this.constants.INSERT:
      await this.insert_product()
      break
    case this.constants.DELETE:
      await this.delete_product()
      break
    case this.constants.ALTER:
      await this.alter_product()
      break
    case this.constants.SHOW_ONE:
      await this.show_product()
      break
    case this.constants.GROUP_CATEGORY:
      await this.show_product_group_category()
      break
    case this.constants.GROUP_MARI:
      await this.show_product_group_mari()
      break
    }

    return 1
  }

  async start() {
    await this.connect()

    while (await this.ask()) {}

    await this.disconnect()
  }
}

const crud = new Crud(connection)

crud.start()

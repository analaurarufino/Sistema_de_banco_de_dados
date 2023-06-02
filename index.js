import "dotenv/config";
import inquirer from "inquirer";

import { connection, Funcionarios, Produtos } from "./tabelas/index.js";
import Clientes from "./tabelas/cliente.js";

class Crud {
  constructor(connection) {
    this.connection = connection;

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
    ];

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
      CREATE_TABLE_FUNC: 9,
      INSERT_CLIENT: 10,
      ALTER_CLIENT: 11,
      LIST_ALL_CLIENTS: 12,
      DELETE_CLIENT: 13,
    };
  }

  async connect() {
    return this.connection.connect();
  }

  async disconnect() {
    return this.connection.end();
  }

  async list_all_products() {
    try {
      const result = await Produtos.listAll();

      console.table(result);
    } catch (e) {
      console.error("[Erro] Listar", e);
    }
  }

  async search_product_name() {
    const prod_name = await inquirer
      .prompt({
        name: "prod_name",
        message: "Digite o nome do produto desejado:",
        type: "input",
        validate: (nome_produto) => {
          return Produtos.validate({ nome_produto });
        },
      })
      .then((answer) => answer.prod_name);

    try {
      const resultado = await Produtos.search(prod_name);

      if (resultado.length == 0) console.log("Nenhum produto foi encontrado.");
      else console.table(resultado);
    } catch (e) {
      console.error("[Erro] Pesquisar", e);
    }
  }

  async insert_product() {
    const nome_produto = await inquirer
      .prompt({
        name: "nome_produto",
        message: "Digite o nome do seu produto:",
        type: "input",
        validate: (nome_produto) => {
          return Produtos.validate({ nome_produto });
        },
      })
      .then((answer) => answer.nome_produto);

    const cod_produto = await inquirer
      .prompt({
        name: "cod_produto",
        message: "Digite o codigo do seu produto:",
        type: "number",
        validate: (cod_produto) =>
          new Promise(async (res) => {
            const status_cod = Produtos.validate({ cod_produto });

            if (status_cod !== true) return res(status_cod);

            const resp = await Produtos.get(cod_produto);

            if (resp.length)
              return res("Esse codigo de produto ja esta sendo usado");

            return res(true);
          }),
      })
      .then((answer) => answer.cod_produto);

    const categoria = await inquirer
      .prompt({
        name: "categoria",
        message: "Digite a categoria do seu produto:",
        type: "list",
        choices: this.categorias,
        loop: false,
      })
      .then((answer) => answer.categoria);

    const preco = await inquirer
      .prompt({
        name: "preco",
        message: "Digite o preço do seu produto:",
        type: "number",
        validate: (preco) => {
          return Produtos.validate({ preco });
        },
      })
      .then((answer) => answer.preco);

    const qtd_estoque = await inquirer
      .prompt({
        name: "qtd_estoque",
        message: "Digite a quantitade presente no estoque:",
        type: "number",
        validate: (qtd_estoque) => {
          return Produtos.validate({ qtd_estoque });
        },
      })
      .then((answer) => answer.qtd_estoque);

    const feito_em_Mari = await inquirer
      .prompt({
        name: "feito_em_Mari",
        message: "Foi feito em Mari?",
        type: "confirm",
      })
      // convert bool to int
      .then((answer) => ~~answer.feito_em_Mari);

    let to_insert = {
      nome_produto,
      cod_produto,
      categoria,
      preco,
      qtd_estoque,
      feito_em_Mari,
    };

    try {
      await Produtos.insert(to_insert);

      console.table([to_insert]);

      console.log("inserido.");
    } catch (e) {
      console.error("[Erro] Inserir", e);
    }
  }

  async delete_product() {
    const codigo_produto = await inquirer
      .prompt({
        name: "codigo_produto",
        message: "Digite o código do produto a ser removido:",
        type: "number",
        validate: (codigo_produto) => {
          return Produtos.validate({ codigo_produto });
        },
      })
      .then((answer) => answer.codigo_produto);

    try {
      const result = await Produtos.remove(codigo_produto);

      if (result.affectedRows === 1) console.log("Produto removido.");
      else console.log("Produto nao encontrado.");
    } catch (e) {
      console.error("[Erro] Remover", e);
    }
  }

  async alter_product() {
    const cod_produto = await inquirer
      .prompt({
        name: "cod_produto",
        message: "Digite o codigo do produto que você quer alterar:",
        type: "number",
        validate: (cod_produto) =>
          new Promise(async (res) => {
            const status = Produtos.validate({ cod_produto });

            if (status !== true) return res(status);

            const resp = await Produtos.get(cod_produto);

            if (!resp.length)
              return res("Nao ha nenhum produto com esse codigo.");

            return res(true);
          }),
      })
      .then((answer) => answer.cod_produto);

    const resp = await Produtos.get(cod_produto);
    console.table(resp);

    const to_alter = {};

    const nome_produto = await inquirer
      .prompt([
        {
          name: "decision",
          message: "Deseja alterar o nome do produto?",
          type: "confirm",
        },
        {
          name: "nome_produto",
          message: "Insira o novo nome do produto:",
          type: "input",
          when: (a) => {
            return a.decision;
          },
          validate: (nome_produto) => {
            return Produtos.validate({ nome_produto });
          },
        },
      ])
      .then((answers) => answers.nome_produto);

    to_alter.nome_produto = nome_produto;

    const categoria = await inquirer
      .prompt([
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
          when: (a) => a.decision,
          loop: false,
        },
      ])
      .then((answers) => answers.categoria);

    to_alter.categoria = categoria;

    const preco = await inquirer
      .prompt([
        {
          name: "decision",
          message: "Deseja alterar o preco do produto?",
          type: "confirm",
        },
        {
          name: "preco",
          message: "Insira o novo preco do produto:",
          type: "number",
          when: (a) => a.decision,
          validate: (preco) => {
            return Produtos.validate({ preco });
          },
        },
      ])
      .then((answers) => answers.preco);

    to_alter.preco = preco;

    const qtd_estoque = await inquirer
      .prompt([
        {
          name: "decision",
          message: "Deseja alterar a quantidade em estoque?",
          type: "confirm",
        },
        {
          name: "qtd_estoque",
          message: "Insira a nova quantidade em estoque:",
          type: "number",
          when: (a) => a.decision,
          validate: (qtd_estoque) => {
            return Produtos.validate({ qtd_estoque });
          },
        },
      ])
      .then((answers) => answers.qtd_estoque);

    to_alter.qtd_estoque = qtd_estoque;

    const feito_em_Mari = await inquirer
      .prompt([
        {
          name: "decision",
          message: "Deseja alterar se o produto foi feito em Mari?",
          type: "confirm",
        },
      ])
      .then((answers) => {
        const to_negate = answers.decision;

        const original = resp["0"].feito_em_Mari;

        // nega o original (se foi indicado) e converte pra inteiro com ~~
        return ~~(to_negate ? !original : original);
      });

    to_alter.feito_em_Mari = feito_em_Mari;

    try {
      await Produtos.alter(Object.assign({ cod_produto }, to_alter));
    } catch (e) {
      console.error("[Erro] Alterar", e);
    }

    const altered = await Produtos.get(cod_produto);

    console.table(altered);
  }

  async show_product() {
    try {
      const resp = await Produtos.showOne();

      console.table(resp);
    } catch (e) {
      console.error("[Erro] Exibir produto", e);
    }
  }

  async show_product_group_category() {
    try {
      const results = await Produtos.groupByCategory();

      console.table(results);
    } catch (e) {
      console.error("[Erro] Exibir por categoria");
    }
  }

  async show_product_group_mari() {
    try {
      const results = await Produtos.productMadeInMari();

      console.table(results);
    } catch (e) {
      console.error("[Erro] Exibir feitos em Mari");
    }
  }

  async create_table_func() {
    try {
      const result = await Funcionarios.createTable();

      console.log(result);
    } catch (e) {
      console.error("[Erro] create", e);
    }
  }

  async create_table_clients() {
    try {
      const result = await Clientes.createTable();

      console.log(result);
    } catch (e) {
      console.error("[Erro] create", e);
    }
  }

  async insert_client() {
    const nome_cliente = await inquirer
      .prompt({
        name: "nome_cliente",
        message: "Digite o nome do cliente:",
        type: "input",
        validate: (nome_cliente) => {
          return Clientes.validate({ nome_cliente });
        },
      })
      .then((answer) => answer.nome_cliente);

    const fan_de_onepiece = await inquirer
      .prompt({
        name: "fan_de_onepiece",
        message: "Cliente é fan de onepiece?",
        type: "confirm",
      })
      // convert bool to int
      .then((answer) => ~~answer.fan_de_onepiece);
    const de_souza = await inquirer
      .prompt({
        name: "de_souza",
        message: "Cliente é de souza?",
        type: "confirm",
      })
      // convert bool to int
      .then((answer) => ~~answer.de_souza);
    const is_flamengo = await inquirer
      .prompt({
        name: "is_flamengo",
        message: "Cliente é flamenguista?",
        type: "confirm",
      })
      // convert bool to int
      .then((answer) => ~~answer.is_flamengo);

    let to_insert = {
      nome_cliente,
      fan_de_onepiece,
      de_souza,
      is_flamengo,
    };

    try {
      await Clientes.insert(to_insert);

      console.table([to_insert]);

      console.log("inserido.");
    } catch (e) {
      console.error("[Erro] Inserir", e);
    }
  }

  async delete_client() {
    const id = await inquirer
      .prompt({
        name: "id",
        message: "Digite o id do cliente a ser removido:",
        type: "number",
        validate: (id) => {
          return Clientes.validate({ id });
        },
      })
      .then((answer) => answer.id);

    try {
      const result = await Clientes.remove(id);

      if (result.affectedRows === 1) console.log("Cliente removido.");
      else console.log("Cliente nao encontrado.");
    } catch (e) {
      console.error("[Erro] Remover", e);
    }
  }

  async alter_client() {
    const id = await inquirer
      .prompt({
        name: "id",
        message: "Digite o id do cliente que você quer alterar:",
        type: "number",
        validate: (id) =>
          new Promise(async (res) => {
            const status = Clientes.validate({ id });

            if (status !== true) return res(status);

            const resp = await Clientes.get(id);

            if (!resp.length) return res("Nao ha nenhum cliente com esse id.");

            return res(true);
          }),
      })
      .then((answer) => answer.id);

    const resp = await Clientes.get(id);
    console.table(resp);

    const to_alter = {};

    const nome_cliente = await inquirer
      .prompt([
        {
          name: "decision",
          message: "Deseja alterar o nome do cliente?",
          type: "confirm",
        },
        {
          name: "nome_cliente",
          message: "Insira o novo nome do cliente:",
          type: "input",
          when: (a) => {
            return a.decision;
          },
          validate: (nome_cliente) => {
            return Clientes.validate({ nome_cliente });
          },
        },
      ])
      .then((answers) => answers.nome_cliente);

    to_alter.nome_cliente = nome_cliente;

    const fan_de_onepiece = await inquirer
      .prompt([
        {
          name: "decision",
          message: "Deseja alterar se o cliente é fan de onepiece?",
          type: "confirm",
        },
      ])
      .then((answers) => {
        const to_negate = answers.decision;

        const original = resp["0"].fan_de_onepiece;

        // nega o original (se foi indicado) e converte pra inteiro com ~~
        return ~~(to_negate ? !original : original);
      });

    to_alter.fan_de_onepiece = fan_de_onepiece;

    const de_souza = await inquirer
      .prompt([
        {
          name: "decision",
          message: "Deseja alterar se o cliente é de souza?",
          type: "confirm",
        },
      ])
      .then((answers) => {
        const to_negate = answers.decision;

        const original = resp["0"].de_souza;

        // nega o original (se foi indicado) e converte pra inteiro com ~~
        return ~~(to_negate ? !original : original);
      });

    to_alter.de_souza = de_souza;

    const is_flamengo = await inquirer
      .prompt([
        {
          name: "decision",
          message: "Deseja alterar se o cliente é flamenguista?",
          type: "confirm",
        },
      ])
      .then((answers) => {
        const to_negate = answers.decision;

        const original = resp["0"].is_flamengo;

        // nega o original (se foi indicado) e converte pra inteiro com ~~
        return ~~(to_negate ? !original : original);
      });

    to_alter.is_flamengo = is_flamengo;

    try {
      await Clientes.alter(Object.assign(to_alter), id);
    } catch (e) {
      console.error("[Erro] Alterar", e);
    }

    const altered = await Clientes.get(id);

    console.table(altered);
  }

  async list_all_clients() {
    try {
      const result = await Clientes.listAll();

      console.table(result);
    } catch (e) {
      console.error("[Erro] Listar", e);
    }
  }

  async ask() {
    const choice = await inquirer
      .prompt([
        {
          type: "list",
          name: "choice",
          message: "Selecione uma das funções abaixo para continuar:",
          choices: [
            { name: "Desconectar", value: this.constants.DISCONNECT },
            { name: "Listar todos produtos", value: this.constants.LIST_ALL },
            {
              name: "Pesquisar produto por nome",
              value: this.constants.SEARCH_NAME,
            },
            { name: "Inserir produto", value: this.constants.INSERT },
            { name: "Remover produto", value: this.constants.DELETE },
            { name: "Alterar produto", value: this.constants.ALTER },
            { name: "Exibir um produto", value: this.constants.SHOW_ONE },
            {
              name: "Exibir produtos por categoria",
              value: this.constants.GROUP_CATEGORY,
            },
            {
              name: "Exibir produtos feitos em Mari",
              value: this.constants.GROUP_MARI,
            },
            {
              name: "Criar tabela Funcionarios",
              value: this.constants.CREATE_TABLE_FUNC,
            },
            {
              name: "Listar clientes",
              value: this.constants.LIST_ALL_CLIENTS,
            },
            {
              name: "Criar cliente",
              value: this.constants.INSERT_CLIENT,
            },
            {
              name: "Alterar cliente",
              value: this.constants.ALTER_CLIENT,
            },
            {
              name: "Remover cliente",
              value: this.constants.DELETE_CLIENT,
            },
          ],
          loop: false,
        },
      ])
      .then((answers) => answers.choice);

    if (choice === this.constants.DISCONNECT) return 0; // signals to stop

    switch (choice) {
      case this.constants.LIST_ALL:
        await this.list_all_products();
        break;
      case this.constants.SEARCH_NAME:
        await this.search_product_name();
        break;
      case this.constants.INSERT:
        await this.insert_product();
        break;
      case this.constants.DELETE:
        await this.delete_product();
        break;
      case this.constants.ALTER:
        await this.alter_product();
        break;
      case this.constants.SHOW_ONE:
        await this.show_product();
        break;
      case this.constants.GROUP_CATEGORY:
        await this.show_product_group_category();
        break;
      case this.constants.GROUP_MARI:
        await this.show_product_group_mari();
      case this.constants.CREATE_TABLE_FUNC:
        await this.create_table_func();
        break;
      case this.constants.LIST_ALL_CLIENTS:
        await this.list_all_clients();
        break;
      case this.constants.INSERT_CLIENT:
        await this.insert_client();
        break;
      case this.constants.ALTER_CLIENT:
        await this.alter_client();
        break;
      case this.constants.DELETE_CLIENT:
        await this.delete_client();
        break;
    }

    return 1;
  }

  async start() {
    await this.connect();

    while (await this.ask()) {}

    await this.disconnect();
  }
}

const crud = new Crud(connection);

crud.start();

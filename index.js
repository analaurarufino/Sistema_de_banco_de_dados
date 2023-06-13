import "dotenv/config";
import inquirer from "inquirer";
import { sha256 } from 'js-sha256';

import {
  connection,
  Funcionarios,
  Produtos,
  ProdutoVendas,
  Vendas,
} from "./tabelas/index.js";
import Clientes from "./tabelas/cliente.js";
import { formatCurrencyInput } from "./helpers.js";

class Crud {
  constructor(connection) {
    this.connection = connection;

    this.carrinho = [];

    this.is_authenticated = false;

    this.bought = false;

    this.client = false;

    this.menuAdmin = {
      Exit: 0,
      REPORTS: 1,
      SHOW: 2,
      INSERT: 3,
      DELETE: 4,
      ALTER: 5,
      LESSTHAN5: 6,
    };

    this.listMenuAdmin = [
      { name: "Relatórios", value: this.menuAdmin.REPORTS },
      {
        name: "Filtrar Produtos com menos de 5 produtos",
        value: this.menuAdmin.LESSTHAN5,
      },
      { name: "Lista Produtos", value: this.menuAdmin.SHOW },
      { name: "Criar Produtos", value: this.menuAdmin.INSERT },
      { name: "Editar Produtos", value: this.menuAdmin.ALTER },
      { name: "Remover Produtos", value: this.menuAdmin.DELETE },
      { name: "Sair", value: 0 },
    ];

    this.listReports = [
      { name: "Produtos feitos em Mari", value: 0 },
      {
        name: "Clientes Flamenguistas",
        value: 1,
      },
      {
        name: "Sair",
        value: 2,
      },
    ];

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

    this.sell = [
      { name: "Adicionar produto", value: "add" },
      { name: "Ver carrinho", value: "card" },
      { name: "Sair", value: "sair" },
    ];

    this.finish = [
      { name: "Adicionar mais produtos", value: "add" },
      { name: "Finalizar compra", value: "finish" },
    ];

    this.paymentMethods = [
      { name: "Pix", value: "pix" },
      { name: "Cartão Crédito", value: "credit" },
      { name: "Cartão Débito", value: "debit" },
      { name: "Dinheiro", value: "money" },
    ];

    this.leaveServer = [
      { name: "Realizar uma nova compra", value: 1 },
      { name: "Sair", value: 0 },
    ];

    this.constants = {
      DISCONNECT: 0,
      LIST_ALL: 1,
      LOGIN: 2,
      ADMIN: 3,
    };
  }

  async connect() {
    return this.connection.connect();
  }

  async disconnect() {
    return this.connection.end();
  }

  async reports() {
    const res = await inquirer
      .prompt({
        name: "res",
        message: "Selecione um opção:",
        type: "list",
        choices: this.listReports,
        loop: true,
      })
      .then((answer) => answer.res);
    if (res == 0) {
      try {
        const resp = await Produtos.productMadeInMari();
        console.table(resp);
      } catch (e) {
        console.error("[Erro] Exibir Produtos", e);
      }
    } else {
      try {
        const resp = await Clientes.ClientesFlamenguistas();
        console.table(resp);
      } catch (e) {
        console.error("[Erro] Exibir Clientes", e);
      }
    }
  }

  async showLessThan() {
    try {
      const resp = await Produtos.LessThanFive();
      console.table(resp);
    } catch (e) {
      console.error("[Erro] Exibir Produtos", e);
    }
  }

  async admin() {
    if (!this.is_authenticated)
      await inquirer
        .prompt({
          name: "cpf",
          message: "Digite o seu cpf:",
          type: "input",
          validate: (cpf) =>
            new Promise(async (res) => {
              const resp = await Funcionarios.search(cpf);

              if (resp.length === 0) return res("Funcionario não existe");

              return res(true);
            }),
        })
        .then((answer) => answer.cpf);
    this.is_authenticated = true;

    const res = await inquirer
      .prompt({
        name: "sell",
        message: "Selecione uma opção",
        type: "list",
        choices: this.listMenuAdmin,
        loop: true,
      })
      .then((answer) => answer.sell);

    switch (res) {
      case this.menuAdmin.INSERT:
        await this.insert_product();
        break;
      case this.menuAdmin.DELETE:
        await this.delete_product();
        break;
      case this.menuAdmin.ALTER:
        await this.alter_product();
      case this.menuAdmin.SHOW:
        await this.show_product();
        break;
      case this.menuAdmin.REPORTS:
        while (await this.reports());
        break;
      case this.menuAdmin.LESSTHAN5:
        await this.showLessThan();
        break;
      case this.menuAdmin.Exit:
        return 0;
    }
    return 1;
  }

  async list_all_products() {
    try {
      const result = await Produtos.listAllActive();
      console.table(result);
      const res = await inquirer
        .prompt({
          name: "sell",
          message: "Selecione uma opção",
          type: "list",
          choices: this.sell,
          loop: true,
        })
        .then((answer) => answer.sell);

      switch (res) {
        case "sair":
          return 0;

        case "add": {
          const prod_cod = await inquirer
            .prompt({
              name: "cod_produto",
              message: "Digite o código do produto desejado:",
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

          const quantidade = await inquirer
            .prompt({
              name: "qtd_estoque",
              message: "Digite a quantitade:",
              type: "number",
              validate: (qtd_estoque) =>
                new Promise(async (res) => {
                  const status = Produtos.validate({ qtd_estoque });

                  if (status !== true) return res(status);

                  const produto = await Produtos.get(prod_cod);
                  const qtd = Object.values(produto[0])[5];

                  const prodExistCard = this.carrinho.find(
                    (item) => item.cod_produto === prod_cod
                  );
                  if (prodExistCard) {
                    const indexProd = this.carrinho.findIndex(
                      (item) => item == prodExistCard
                    );
                    if (qtd_estoque + this.carrinho[indexProd].quantidade > qtd)
                      return res(
                        "Quantia presente no carrinho e a digitada excede a quantidade no estoque"
                      );
                  }

                  if (qtd_estoque > qtd)
                    return res("Quantia excede a quantidade no estoque");

                  return res(true);
                }),
            })
            .then((answer) => answer.qtd_estoque);

          const resp = await Produtos.get(prod_cod);
          const dados = Object.values(resp[0]);

          const prodExistCard = this.carrinho.find(
            (item) => item.cod_produto === dados[1]
          );

          if (prodExistCard) {
            const indexCard = this.carrinho.findIndex(
              (item) => item == prodExistCard
            );
            this.carrinho[indexCard] = {
              cod_produto: dados[1],
              produto: dados[2],
              quantidade: quantidade + this.carrinho[indexCard].quantidade,
              valor: dados[3],
              qtd_estoque: dados[5],
            };
          } else {
            this.carrinho.push({
              cod_produto: dados[1],
              produto: dados[2],
              quantidade,
              valor: dados[3],
              qtd_estoque: dados[5],
            });
          }

          console.log("Produto adicionado ao carrinho com sucesso\n");
          return 1;
        }

        case "card":
          const finish = await this.summary();
          if (finish) return 1;
          return 0;
      }
    } catch (e) {
      console.error("[Erro] Listar", e);
      return 1;
    }
  }

  async get_client_by_name(name) {
    try {
      const data = await Clientes.search(name);
      console.table(data);
      return data;
    } catch (e) {
      console.error("[Erro] Listar", e);
    }
  }

  async get_client_by_id(id) {
    try {
      const data = await Clientes.getById(id);
      console.table(data);
      return data;
    } catch (e) {
      console.error("[Erro] Listar", e);
    }
  }

  async summary() {
    console.log("\nProdutos:");
    console.table(this.carrinho);
    let total = Object.values(this.carrinho).reduce(
      (prev, curr) => prev + curr.valor * curr.quantidade,
      0
    );
    console.log("Total: ", formatCurrencyInput(total), "\n");
    const res = await inquirer
      .prompt({
        name: "finish",
        message: "Selecione uma opção",
        type: "list",
        choices: this.finish,
        loop: true,
      })
      .then((answer) => answer.finish);
    switch (res) {
      case "add":
        return 1;

      case "finish": {
        while (!this.is_authenticated) {
          console.log(
            "\nPara finalizar a compra você deve informar seus dados\n"
          );
          const loginOptions = [
            { name: "Já sou Cliente", value: 0 },
            { name: "Criar conta", value: 1 },
          ];
          const res = await inquirer
            .prompt({
              name: "res",
              message: "Selecione um opção:",
              type: "list",
              choices: loginOptions,
              loop: true,
            })
            .then((answer) => answer.res);
          switch (res) {
            case 0: {
              const id = await inquirer
                .prompt({
                  name: "id",
                  message: "Digite o id:",
                  type: "input",
                })
                .then((answer) => answer.id);
              const data = await this.get_client_by_id(id);
              this.client = Object.values(data[0])[0];
              this.is_authenticated = true;
              break;
            }
            case 1: {
              //Criando conta
              const data = await this.insert_client();
              const d = await this.get_client_by_name(data.nome_cliente);
              this.client = Object.values(d[0])[0];
              this.is_authenticated = true;
              break;
            }
          }
        }
        const funcionarios = await this.show_funcionarios();
        const data = funcionarios.map((item, index) => ({
          value: Object.values(item)[0],
          name: `Caixa ${index + 1} -- Atendente: ${Object.values(item)[1]}`,
        }));
        const funcionario_id = await inquirer
          .prompt({
            name: "funcionario_id",
            message: "Selecione um caixa",
            type: "list",
            choices: data,
            loop: true,
          })
          .then((answer) => answer.funcionario_id);

        const forma_pagamento = await inquirer
          .prompt({
            name: "forma_pagamento",
            message: "Selecione a forma de pagamento",
            type: "list",
            choices: this.paymentMethods,
            loop: true,
          })
          .then((answer) => answer.forma_pagamento);
        const cli = await Clientes.getById(this.client);
        const clientData = Object.values(cli[0]);
        let desconto = 0;
        if (clientData[2] == 1) {
          desconto = desconto + 0.1;
        }
        if (clientData[3]) {
          desconto = desconto + 0.1;
        }
        if (clientData[4]) {
          desconto = desconto + 0.1;
        }

        if (desconto > 0) {
          total = total - total * desconto;
        }

        const sale = {
          date_venda: new Date().toLocaleString().slice(0, 10),
          valor_total: total,
          forma_pagamento: String(forma_pagamento),
          status_compra: "Finalizada",
          cliente_id: this.client,
          funcionario_id,
        };

        const compra = await Vendas.createSale(sale);
        console.table(sale);
        const venda_id = Object.values(compra)[2];

        for (let index = 0; index < this.carrinho.length; index++) {
          await Produtos.alter({
            cod_produto: this.carrinho[index].cod_produto,
            qtd_estoque:
              this.carrinho[index].qtd_estoque -
              this.carrinho[index].quantidade,
          });
          await ProdutoVendas.insert({
            cod_produto: this.carrinho[index].cod_produto,
            quantidade: this.carrinho[index].quantidade,
            venda_id,
          });
        }

        console.log("Compra realizada com sucesso!");
        this.bought = true;

        return 0;
      }
    }
  }

  async show_funcionarios() {
    try {
      const resp = await Funcionarios.listAll();
      return resp;
    } catch (e) {
      console.error("[Erro] Exibir funcionarios", e);
      return [];
    }
  }

  async insert_client() {
    const nome_cliente = await inquirer
      .prompt({
        name: "nome_cliente",
        message: "Digite o nome do cliente:",
        type: "input",
        validate: (nome_cliente) =>
          new Promise(async (res) => {
            const status = Clientes.validate({ nome_cliente });

            if (status !== true) return res(status);

            const resp = await Clientes.search(nome_cliente);

            if (resp.length > 0) return res("Cliente existente");

            return res(true);
          }),
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

    const senha = await inquirer
      .prompt({
        name: "senha",
        message: "Digite a sua senha:",
        type: "password",
        validate: (senha) => {
          const status_cod = Clientes.validate({ senha });

          if (status_cod !== true) return status_cod;

          return true;
        }
      })
      .then((answer) => sha256(answer.senha))

    let to_insert = {
      nome_cliente,
      fan_de_onepiece,
      de_souza,
      is_flamengo,
      senha,
    };

    try {
      await Clientes.insert(to_insert);
      return to_insert;
    } catch (e) {
      console.error("[Erro] Inserir", e);
    }
  }

  async show_product() {
    try {
      const resp = await Produtos.listAll();

      console.table(resp);
    } catch (e) {
      console.error("[Erro] Exibir produto", e);
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

  async ask() {
    const choice = await inquirer
      .prompt([
        {
          type: "list",
          name: "choice",
          message:
            "Olá! Bem-vindo(a)! Por favor, selecione uma das funções abaixo para continuar:",
          choices: [
            { name: "Nossos Produtos", value: this.constants.LIST_ALL },
            {
              name: "Fazer login",
              value: this.constants.LOGIN,
            },
            {
              name: "Sou funcionário, Acesso Admin",
              value: this.constants.ADMIN,
            },
            { name: "Sair", value: this.constants.DISCONNECT },
          ],
          loop: false,
        },
      ])
      .then((answers) => answers.choice);

    if (choice === this.constants.DISCONNECT) return 0; // signals to stop

    switch (choice) {
      case this.constants.LIST_ALL:
        while (true) {
          while (await this.list_all_products());
          if (this.bought) {
            const res = await inquirer
              .prompt({
                name: "res",
                message: "Selecione um opção:",
                type: "list",
                choices: this.leaveServer,
                loop: true,
              })
              .then((answer) => answer.res);
            if (res == 0) {
              this.is_authenticated = false;
              this.carrinho = [];
              this.client = null;
              break;
            } else {
              this.carrinho = [];
            }
          } else {
            this.is_authenticated = false;
            this.carrinho = [];
            this.client = null;
            this.bought = false;
            break;
          }
        }

        break;
      case this.constants.LOGIN:
        await this.login();
        break;
      case this.constants.ADMIN:
        while (await this.admin());
        this.is_authenticated = false; // admin logged off
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

// case this.constants.SEARCH_NAME:
//   await this.search_product_name();
//   break;

// case this.constants.SHOW_ONE:
//   await this.show_product();
//   break;
// case this.constants.GROUP_CATEGORY:
//   await this.show_product_group_category();
//   break;
// case this.constants.GROUP_MARI:
//   await this.show_product_group_mari();
// case this.constants.CREATE_TABLE_PRODUTOVENDA:
//   await this.create_table_produto_venda();
//   break;
// case this.constants.LIST_ALL_CLIENTS:
//   await this.list_all_clients();
//   break;
// case this.constants.INSERT_CLIENT:
//   await this.insert_client();
//   break;
// case this.constants.ALTER_CLIENT:
//   await this.alter_client();
//   break;
// case this.constants.DELETE_CLIENT:
//   await this.delete_client();
//   break;

// SEARCH_NAME: 2,
// INSERT: 3,
// DELETE: 4,
// ALTER: 5,
// SHOW_ONE: 6,
// GROUP_CATEGORY: 7,
// GROUP_MARI: 8,
// CREATE_TABLE_PRODUTOVENDA: 9,
// INSERT_CLIENT: 10,
// ALTER_CLIENT: 11,
// LIST_ALL_CLIENTS: 12,
// DELETE_CLIENT: 13,

// { name: "Remover produto", value: this.constants.DELETE },
// { name: "Alterar produto", value: this.constants.ALTER },
// { name: "Exibir um produto", value: this.constants.SHOW_ONE },
// {
//   name: "Exibir produtos por categoria",
//   value: this.constants.GROUP_CATEGORY,
// },
// {
//   name: "Exibir produtos feitos em Mari",
//   value: this.constants.GROUP_MARI,
// },
// {
//   name: "Criar tabela ProdutoVendas",
//   value: this.constants.CREATE_TABLE_PRODUTOVENDA,
// },
// {
//   name: "Listar clientes",
//   value: this.constants.LIST_ALL_CLIENTS,
// },
// {
//   name: "Criar cliente",
//   value: this.constants.INSERT_CLIENT,
// },
// {
//   name: "Alterar cliente",
//   value: this.constants.ALTER_CLIENT,
// },
// {
//   name: "Remover cliente",
//   value: this.constants.DELETE_CLIENT,
// },

// async show_product_group_category() {
//   try {
//     const results = await Produtos.groupByCategory();

//     console.table(results);
//   } catch (e) {
//     console.error("[Erro] Exibir por categoria");
//   }
// }

// async show_product_group_mari() {
//   try {
//     const results = await Produtos.productMadeInMari();

//     console.table(results);
//   } catch (e) {
//     console.error("[Erro] Exibir feitos em Mari");
//   }
// }

// async create_table_func() {
//   try {
//     const result = await Funcionarios.createTable();

//     console.log(result);
//   } catch (e) {
//     console.error("[Erro] create", e);
//   }
// }

// async create_table_clients() {
//   try {
//     const result = await Clientes.createTable();

//     console.log(result);
//   } catch (e) {
//     console.error("[Erro] create", e);
//   }
// }

// async create_table_venda() {
//   try {
//     const result = await Vendas.createTable();

//     console.log(result);
//   } catch (e) {
//     console.error("[Erro] create", e);
//   }
// }

// async create_table_produto_venda() {
//   try {
//     const result = await ProdutoVendas.createTable();

//     console.log(result);
//   } catch (e) {
//     console.error("[Erro] create", e);
//   }
// }

// async delete_client() {
//   const id = await inquirer
//     .prompt({
//       name: "id",
//       message: "Digite o id do cliente a ser removido:",
//       type: "number",
//       validate: (id) => {
//         return Clientes.validate({ id });
//       },
//     })
//     .then((answer) => answer.id);

//   try {
//     const result = await Clientes.remove(id);

//     if (result.affectedRows === 1) console.log("Cliente removido.");
//     else console.log("Cliente nao encontrado.");
//   } catch (e) {
//     console.error("[Erro] Remover", e);
//   }
// }

// async alter_client() {
//   const id = await inquirer
//     .prompt({
//       name: "id",
//       message: "Digite o id do cliente que você quer alterar:",
//       type: "number",
//       validate: (id) =>
//         new Promise(async (res) => {
//           const status = Clientes.validate({ id });

//           if (status !== true) return res(status);

//           const resp = await Clientes.get(id);

//           if (!resp.length) return res("Nao ha nenhum cliente com esse id.");

//           return res(true);
//         }),
//     })
//     .then((answer) => answer.id);

//   const resp = await Clientes.get(id);
//   console.table(resp);

//   const to_alter = {};

//   const nome_cliente = await inquirer
//     .prompt([
//       {
//         name: "decision",
//         message: "Deseja alterar o nome do cliente?",
//         type: "confirm",
//       },
//       {
//         name: "nome_cliente",
//         message: "Insira o novo nome do cliente:",
//         type: "input",
//         when: (a) => {
//           return a.decision;
//         },
//         validate: (nome_cliente) => {
//           return Clientes.validate({ nome_cliente });
//         },
//       },
//     ])
//     .then((answers) => answers.nome_cliente);

//   to_alter.nome_cliente = nome_cliente;

//   const fan_de_onepiece = await inquirer
//     .prompt([
//       {
//         name: "decision",
//         message: "Deseja alterar se o cliente é fan de onepiece?",
//         type: "confirm",
//       },
//     ])
//     .then((answers) => {
//       const to_negate = answers.decision;

//       const original = resp["0"].fan_de_onepiece;

//       // nega o original (se foi indicado) e converte pra inteiro com ~~
//       return ~~(to_negate ? !original : original);
//     });

//   to_alter.fan_de_onepiece = fan_de_onepiece;

//   const de_souza = await inquirer
//     .prompt([
//       {
//         name: "decision",
//         message: "Deseja alterar se o cliente é de souza?",
//         type: "confirm",
//       },
//     ])
//     .then((answers) => {
//       const to_negate = answers.decision;

//       const original = resp["0"].de_souza;

//       // nega o original (se foi indicado) e converte pra inteiro com ~~
//       return ~~(to_negate ? !original : original);
//     });

//   to_alter.de_souza = de_souza;

//   const is_flamengo = await inquirer
//     .prompt([
//       {
//         name: "decision",
//         message: "Deseja alterar se o cliente é flamenguista?",
//         type: "confirm",
//       },
//     ])
//     .then((answers) => {
//       const to_negate = answers.decision;

//       const original = resp["0"].is_flamengo;

//       // nega o original (se foi indicado) e converte pra inteiro com ~~
//       return ~~(to_negate ? !original : original);
//     });

//   to_alter.is_flamengo = is_flamengo;

//   try {
//     await Clientes.alter(Object.assign(to_alter), id);
//   } catch (e) {
//     console.error("[Erro] Alterar", e);
//   }

//   const altered = await Clientes.get(id);

//   console.table(altered);
// }

// async list_all_clients() {
//   try {
//     const result = await Clientes.listAll();

//     console.table(result);
//   } catch (e) {
//     console.error("[Erro] Listar", e);
//   }
// }

// async search_product_name() {
//   const prod_name = await inquirer
//     .prompt({
//       name: "prod_name",
//       message: "Digite o nome do produto desejado:",
//       type: "input",
//       validate: (nome_produto) => {
//         return Produtos.validate({ nome_produto });
//       },
//     })
//     .then((answer) => answer.prod_name);

//   try {
//     const resultado = await Produtos.search(prod_name);

//     if (resultado.length == 0) console.log("Nenhum produto foi encontrado.");
//     else console.table(resultado);
//   } catch (e) {
//     console.error("[Erro] Pesquisar", e);
//   }
// }

import inquirer from 'inquirer';
import readline from 'readline-sync';
import fs from 'fs';

const menu = ['Criar categoria', 'Criar produto', 'Listar produtos por categoria', 'Buscar produto', 'sair'];

function limpar() {
    console.clear();
};
limpar()

let categorias = [];
let produtos = [];

const user = readline.question('Seu nome: ');
limpar()
console.log('Ola ' + user + '!');

function Menus() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'escolha',
                message: 'Escolha uma opção:',
                choices: menu,
            },
        ])
        .then((answers) => {
            switch (answers.escolha) {
                case 'Criar categoria':
                    createCategory();
                    break;
                case 'Criar produto':
                    createProduct();
                    break;
                case 'Listar produtos por categoria':
                    listProductsByCategory();
                    break;
                case 'Buscar produto':
                    searchProduct();
                    break;
                case 'sair':
                    console.log('Saindo...');
                    process.exit(0);
                    break;
            }
        })
        .catch((error) => {
            console.error('Ocorreu um erro:', error.message || error);
            Menus();
        });
};

function createCategory() {
    limpar()
    console.log('===Criar categoria===');
    const nome_categoria = readline.question('Nome da categoria: ');
    categorias.push(nome_categoria);
    if (!fs.existsSync('categorias.json')) {
        fs.writeFileSync('categorias.json', JSON.stringify(categorias, null, 2));
        const categoriasExistentes = JSON.parse(fs.readFileSync('categorias.json', 'utf8'));
        console.log('Categoria criada com sucesso!');
    }
    else {
        const categoriasExistentes = JSON.parse(fs.readFileSync('categorias.json', 'utf8'));
        categoriasExistentes.push(nome_categoria);
        fs.writeFileSync('categorias.json', JSON.stringify(categoriasExistentes, null, 2));
        console.log('Categoria criada com sucesso!');
    }
    limpar()
    Menus();
}

async function createProduct() {
    limpar();
    console.log('=== Criar produto ===');

    const nome_produto = readline.question('Nome do produto: ');
    const preco_produto = readline.question('Preço do produto: ');
    if (isNaN(preco_produto) || preco_produto <= 0) {
        console.log('Preço inválido! O preço deve ser um número maior que zero.');
        limpar()
        Menus();
        return;
    }
    if (nome_produto === '') {
        console.log('Nome do produto não pode ser vazio!');
        limpar()
        Menus();
        return;
    }
    let categoriasDisponiveis = [];
    if (fs.existsSync('categorias.json')) {
        const dados = fs.readFileSync('categorias.json', 'utf8');
        if (dados.trim() !== '') {
            categoriasDisponiveis = JSON.parse(dados);
        }
    }

    if (categoriasDisponiveis.length === 0) {
        console.log('Não há categorias disponíveis. Crie uma antes.');
        return Menus();
    }

    const resposta = await inquirer.prompt([
        {
            type: 'list',
            name: 'categoriaEscolhida',
            message: 'Escolha uma categoria:',
            choices: categoriasDisponiveis,
        },
    ]);

    const produto = {
        nome: nome_produto,
        preco: preco_produto,
        categoria: resposta.categoriaEscolhida,
    };

    let produtosExistentes = [];
    if (fs.existsSync('produtos.json')) {
        const dados = fs.readFileSync('produtos.json', 'utf8');
        if (dados.trim() !== '') {
            produtosExistentes = JSON.parse(dados);
        }
    }

    produtosExistentes.push(produto);
    fs.writeFileSync('produtos.json', JSON.stringify(produtosExistentes, null, 2));
    console.log('Produto criado com sucesso!');
    limpar();
    Menus();
}

function listProductsByCategory() {
    console.log('=== Listar produtos por categoria ===');

    let categoriasExistentes = [];
    if (fs.existsSync('categorias.json')) {
        const dadosCategorias = fs.readFileSync('categorias.json', 'utf8');
        if (dadosCategorias.trim() !== '') {
            categoriasExistentes = JSON.parse(dadosCategorias);
        }
    }

    if (categoriasExistentes.length === 0) {
        console.log('Nenhuma categoria cadastrada!');
        limpar()
        Menus();
        return;
    }

    const categoriaIndex = readline.keyInSelect(categoriasExistentes, 'Escolha uma categoria: ');
    if (categoriaIndex === -1) {
        console.log('Nenhuma categoria escolhida!');
        limpar()
        Menus();
        return;
    }

    const categoriaEscolhida = categoriasExistentes[categoriaIndex];

    let produtosExistentes = [];
    if (fs.existsSync('produtos.json')) {
        const dadosProdutos = fs.readFileSync('produtos.json', 'utf8');
        if (dadosProdutos.trim() !== '') {
            produtosExistentes = JSON.parse(dadosProdutos);
        }
    }

    const produtosFiltrados = produtosExistentes.filter(
        (produto) => produto.categoria === categoriaEscolhida
    );

    if (produtosFiltrados.length === 0) {
        console.log(`Nenhum produto encontrado na categoria "${categoriaEscolhida}".`);
    } else {
        limpar();
        console.log(`Produtos da categoria "${categoriaEscolhida}":\n`);
        produtosFiltrados.forEach((produto, index) => {
            console.log(`${index + 1}. ${produto.nome} - R$ ${produto.preco}`);
        });
    }
    Menus();
}

function searchProduct() {
    limpar()
    console.log('=== Buscar produto ===');
    const nomeProduto = readline.question('Nome do produto: ');

    let categoriasExistentes = [];
    if (fs.existsSync('categorias.json')) {
        const dadosCategorias = fs.readFileSync('categorias.json', 'utf8');
        if (dadosCategorias.trim() !== '') {
            categoriasExistentes = JSON.parse(dadosCategorias);
        }
    }

    let produtosExistentes = [];
    if (fs.existsSync('produtos.json')) {
        const dadosProdutos = fs.readFileSync('produtos.json', 'utf8');
        if (dadosProdutos.trim() !== '') {
            produtosExistentes = JSON.parse(dadosProdutos);
        }
    }

    const produtosFiltrados = produtosExistentes.filter((produto) =>
        produto.nome.toLowerCase().includes(nomeProduto.toLowerCase())
    );
    if (nomeProduto === '') {
        console.log('Nenhum produto encontrado!');
    } else if (produtosFiltrados.length === 0) {
        console.log(`Nenhum produto encontrado com o nome "${nomeProduto}".`);
    } else {
        limpar();
        console.log(`Produtos encontrados com o nome "${nomeProduto}":\n`);
        produtosFiltrados.forEach((produto, index) => {
            console.log(`${index + 1}. ${produto.nome} - R$ ${produto.preco} - Categoria: ${produto.categoria} `);
        });
    }
    Menus();
}

Menus();
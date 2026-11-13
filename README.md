# Portal 137

Portal 137 é um projeto de fã e portfólio para explorar o universo de Rick and Morty em português do Brasil. Os nomes originais dos personagens, episódios e locais são preservados.

## Funcionalidades

- Sorteio de um personagem de todo o catálogo, com base no total e na paginação da API.
- Busca por nome com sugestões e seleção por ID, filtros combináveis de status e espécie e paginação compartilhável pela URL.
- Perfis com links para locais e episódios, além de páginas de elenco e residentes carregadas em lote.
- Favoritos persistentes no navegador, com sincronização entre as telas.

- Comparação de dois personagens com seleção compartilhável pela URL e links para os episódios em comum.

- Arquivo da Cidadela com variantes selecionadas, primeira aparição e atalho para comparar dois personagens.

## Stack

Next.js com App Router, TypeScript, Tailwind CSS, Lucide React e localStorage. A aplicação consome a Rick and Morty API e funciona sem login, banco de dados ou chaves.

## Rodar localmente

Use Node.js 20.9 ou superior e npm.

```sh
npm ci
npm run dev
```

Abra [localhost:3000](http://localhost:3000).

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

A aplicação usa renderização no servidor e uma rota de API para o sorteio. Para hospedar o site, use um ambiente que execute Next.js.

## Créditos

Dados e imagens fornecidos pela [Rick and Morty API](https://rickandmortyapi.com/documentation). Projeto de fã independente, sem afiliação oficial com Rick and Morty.

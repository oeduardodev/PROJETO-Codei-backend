# CODEI Backend

<div align="center">
  <h1>Codei API</h1>
  <p><strong>O núcleo da plataforma social para desenvolvedores.</strong></p>
  <p>Este backend concentra autenticação, perfis, feed, comentários, amizades, notificações, upload de mídia e chat em tempo real para sustentar a experiência completa do Codei.</p>
</div>

---

## Visão Geral

O **Codei Backend** é a API responsável por dar vida à proposta da plataforma: uma rede social voltada para programadores.

A ideia do projeto é unir elementos de comunidade, identidade profissional e interação cotidiana em um mesmo ambiente. Em vez de ser apenas um espaço para publicar conteúdo, o Codei busca ser um lugar para mostrar evolução, compartilhar momentos, criar conexões e conversar com outras pessoas da área.

## Responsabilidades da API

- Cadastro e login de usuários
- Autenticação com token
- Login social com Google OAuth
- Criação e leitura de perfis
- Publicação e gerenciamento de momentos
- Comentários e curtidas
- Sistema de amizades
- Mensagens entre usuários
- Notificações internas
- Upload de imagens com Cloudinary
- Comunicação em tempo real com WebSocket

## Stack do projeto

| Camada | Tecnologias |
| --- | --- |
| Runtime | Node.js |
| Framework | AdonisJS 5 |
| Linguagem | TypeScript |
| ORM | Lucid ORM |
| Banco de dados | SQLite e PostgreSQL |
| Autenticação | Adonis Auth + token |
| Tempo real | Socket.IO |
| Upload de mídia | Cloudinary |
| Integrações externas | Google OAuth |
| Qualidade e estilo | ESLint, Prettier |

## Módulos principais

| Módulo | Papel dentro da plataforma |
| --- | --- |
| `auth` | registro, login, usuário autenticado e OAuth com Google |
| `profile` | criação, leitura, edição e busca de perfis |
| `moments` | feed de publicações, detalhes e exclusão |
| `comments` | comentários por momento |
| `likes` | curtidas por publicação |
| `friends` | vínculo social entre usuários |
| `message` | conversas e atualização de leitura |
| `notifications` | eventos sociais e alertas internos |
| `socket` | entrega de mensagens em tempo real |

## Rotas em alto nível

As rotas ficam agrupadas sob o prefixo:

```text
/api
```

Principais grupos disponíveis:

- `/api/auth`
- `/api/moments`
- `/api/profile`
- `/api/message`
- `/api/friends`
- `/api/notifications`

## Estrutura resumida

```text
app/
  Controllers/Http/   # regras de entrada e saída da API
  Models/             # modelos e relacionamentos
  Services/           # serviços como Cloudinary, notificações e websocket
config/               # banco, auth, cors, app, hash e drive
database/migrations/  # estrutura do banco
start/                # rotas, kernel e socket bootstrap
```

## Diferenciais técnicos do projeto

- API organizada por domínio, com controllers separados por responsabilidade
- Suporte a **SQLite** para desenvolvimento simples e **PostgreSQL** para cenários mais robustos
- Upload de imagens para a nuvem com **Cloudinary**
- Sistema de notificação disparado por eventos sociais, como amizade e nova publicação
- Entrega de mensagens em tempo real usando **Socket.IO**
- Fluxo de autenticação tradicional e também via **Google OAuth**

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- npm
- Um arquivo de ambiente baseado em `env.example`

### Instalação

```bash
npm install
```

### Configuração do ambiente

Crie seu arquivo `.env` a partir de `env.example` e ajuste os valores necessários para o seu cenário.

As variáveis mais importantes para começar são:

```env
HOST=127.0.0.1
PORT=3333
APP_KEY=sua_chave
NODE_ENV=development
DB_CONNECTION=sqlite
FRONTEND_URL=http://localhost:4200
```

Se quiser usar upload de imagem e login social, também será preciso configurar:

- Cloudinary
- Google OAuth

## Banco de dados

O projeto já está preparado para trabalhar com dois cenários:

- `sqlite` para desenvolvimento local rápido
- `pg` para uso com PostgreSQL via `DATABASE_URL`

### Rodando as migrations

```bash
node ace migration:run
```

## Executando a aplicação

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## Scripts disponíveis

```bash
npm run dev     # ambiente de desenvolvimento com watch
npm run build   # build de produção
npm start       # executa a build gerada
npm run lint    # valida padrão de código
npm run format  # formata os arquivos com Prettier
```

## Fluxo funcional da plataforma

O backend foi desenhado para sustentar uma experiência social completa:

1. O usuário cria conta.
2. O perfil passa a concentrar identidade, tecnologias, bio, níveis e relações.
3. Os momentos publicados alimentam o feed da comunidade.
4. Comentários, curtidas e amizades geram engajamento.
5. Mensagens e notificações mantêm a plataforma viva em tempo real.

## Ideia do produto

> O Codei parte da vontade de criar uma rede social em que programadores possam ser vistos não só pelo currículo, mas também pelo processo, pelas conversas e pela comunidade que constroem.

Esse backend existe para sustentar essa visão com uma base técnica que une API REST, eventos em tempo real e integrações úteis para a experiência do usuário.

## Status

Projeto funcional e com boa base para crescer em escalabilidade, segurança, cobertura de testes e documentação mais profunda de endpoints.

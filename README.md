# Plataforma Codei Backend

Este repositório contém o código-fonte do backend da plataforma Codei, uma aplicação web desenvolvida com Node.js utilizando o framework AdonisJS. O objetivo do projeto é fornecer uma rede social voltada para programadores.

## Índice

- [Instalação](#instalação)
- [Endpoints](#endpoints)
  - [Usuários](#usuários)
  - [Momentos](#momentos)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Licença](#licença)

## Instalação

Para instalar e executar o projeto, siga os passos abaixo:

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **NPM**
- **PostgreSQL/SQLite** (de acordo com a configuração escolhida)

### Passos

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/oeduardodev/plataforma-codei-backend.git
   cd plataforma-codei-backend
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure o banco de dados:**

   Crie um arquivo `.env` a partir do arquivo `.env.example` e configure as variáveis de ambiente conforme necessário.

4. **Execute as migrações:**

   ```bash
   node ace migration:run
   ```

5. **Inicie o servidor:**

   ```bash
   npm run dev
   ```

## Endpoints

### Usuários

- **Criar usuário**

  - **Método:** `POST`
  - **Endpoint:** `/users`
  - **Corpo da Requisição:**

    ```json
    {
      "username": "Teste_Usuario",
      "email": "teste@teste.com",
      "password": "123",
      "photo": ""
    }
    ```

  - **Resposta:**

    ```json
    {
      "username": "Teste_Usuario",
      "email": "teste@teste.com",
      "photo": "",
      "password": "$argon2id$v=19$=3,m=4096,p=1$32a52d32dd2b4d/aeh7A$fwwaO6NyDEamJhK3i6Ff4cYAay5QcXtTL6psUL8",
      "created_at": "2025-01-12T11:03:14.122-03:00",
      "updated_at": "2025-01-12T11:03:14.122-03:00",
      "id": 7
    }
    ```

- **Listar usuários**

  - **Método:** `GET`
  - **Endpoint:** `/users`

  ```json
  {
    [
    {
        "id": 9,
        "username": "teste236",
        "email": "teste236@teste.com",
        "password": "$argon2id$v=19$t=3,m=4096,p=1$2xV8pXh+Kqpp7h5Vu99MzA$qGpYO9JhEn47ROge42TZElcMJ46nK9lHZ0Ayvbx7AkA",
        "photo": "",
        "is_admin": 0,
        "created_at": "2025-01-12T11:30:00.000-03:00",
        "updated_at": "2025-01-12T11:30:00.000-03:00"
    },
    {
        "id": 10,
        "username": "teste237",
        "email": "teste237@teste.com",
        "password": "$argon2id$v=19$t=3,m=4096,p=1$Gy3tRjF7Z5kFppGBhxaJdg$ZXWvve93Fw2wqa+uLmpH5XmGk0QMGWlXyUOsZh1vMks",
        "photo": "",
        "is_admin": 0,
        "created_at": "2025-01-12T11:35:00.000-03:00",
        "updated_at": "2025-01-12T11:35:00.000-03:00"
    },
    {
        "id": 11,
        "username": "teste238",
        "email": "teste238@teste.com",
        "password": "$argon2id$v=19$t=3,m=4096,p=1$HkGG9Fjgs0W+Yq5H9a2TmA$xlqVu9KhbXxyV7T6NJzGpfgJ3uIFgHqg70zN1PjD1WA",
        "photo": "",
        "is_admin": 0,
        "created_at": "2025-01-12T11:40:00.000-03:00",
        "updated_at": "2025-01-12T11:40:00.000-03:00"
    },
    {
        "id": 12,
        "username": "teste239",
        "email": "teste239@teste.com",
        "password": "$argon2id$v=19$t=3,m=4096,p=1$GMF6BhY+yfOwGHZ6hxUb6Q$60PyXEK7wTuBoPPLQdoepZzHT1HJzOsbL9k6axYs7es",
        "photo": "",
        "is_admin": 0,
        "created_at": "2025-01-12T11:45:00.000-03:00",
        "updated_at": "2025-01-12T11:45:00.000-03:00"
    }
    ]
  }

  ```

- **Obter detalhes do usuário**

  - **Método:** `GET`
  - **Endpoint:** `/users/:id`
    ```json
    {
      "username": "Teste_Usuario",
      "email": "teste@teste.com",
      "photo": "",
      "password": "$argon2id$v=19$=3,m=4096,p=1$32a52d32dd2b4d/aeh7A$fwwaO6NyDEamJhK3i6Ff4cYAay5QcXtTL6psUL8",
      "created_at": "2025-01-12T11:03:14.122-03:00",
      "updated_at": "2025-01-12T11:03:14.122-03:00",
      "id": 7
    }
    ```

- **Atualizar usuário**

  - **Método:** `PUT`
  - **Endpoint:** `/profile/:id`
  - **Corpo da Requisição:**
    ```json
    {
      "photo": "https://avatars.githubusercontent.com/u/94940400?v=4",
      "bio": "teste de biografia teste",
      "technologies": ["java", "javascript", "php"],
      "friends": [8, 3, 4, 9],
      "levels": ["bugador", "mestre", "Tá em PROD"],
      "username": "new_username"
    }
    ```

- **Deletar usuário**

  - **Método:** `DELETE`
  - **Endpoint:** `/users/:id`

### Momentos

- **Criar momento**

  - **Método:** `POST`
  - **Endpoint:** `/moments`
  - **Corpo da Requisição:**

    ```json
    {
      "title": "Título do momento",
      "description": "Descrição do momento",
      "image": "url",
      "user_id": 1,
      "created_at": "2024-10-13T00:00:00.000Z",
      "updated_at": "2024-10-13T00:00:00.000Z"
    }
    ```

    - **Resposta da Requisição:**

    ```json
    {
      "message": "Momento adicionado com sucesso!",
      "data": {
        "title": "Título do momento",
        "description": "Descrição do momento",
        "image": "url",
        "user_id": 1,
        "created_at": "2024-10-13T00:00:00.000Z",
        "updated_at": "2024-10-13T00:00:00.000Z",
        "id": 2
      }
    }
    ```

- **Listar momentos**

  - **Método:** `GET`
  - **Endpoint:** `/moments`

  ```json
  {
    "data": [
      {
        "id": 1,
        "usuario_id": 5,
        "titulo": "Meu Primeiro Post",
        "descricao": "Esta é a descrição do meu primeiro post.",
        "imagem": "url",
        "curtidas": 10,
        "criado_em": "2024-10-15T12:34:56.000-03:00",
        "atualizado_em": "2024-11-10T14:20:30.000-03:00",
        "comentarios": [
          {
            "id": 1,
            "usuario_id": 7,
            "texto": "Ótimo post!",
            "criado_em": "2024-10-16T08:15:00.000-03:00"
          }
        ]
      },
      {
        "id": 2,
        "usuario_id": 8,
        "titulo": "Print do bug bizarro",
        "descricao": "Mano, alguém consegue me ajudar com esse bug?",
        "imagem": "natureza_foto.jpg",
        "curtidas": 23,
        "criado_em": "2024-11-05T15:22:11.000-03:00",
        "atualizado_em": "2024-11-10T18:40:00.000-03:00",
        "comentarios": []
      },
      {
        "id": 3,
        "usuario_id": 12,
        "titulo": "Diário de dev nômade",
        "descricao": "Compartilhando minhas experiências de viagem e codando pelo mundo.",
        "imagem": "diario_viagem.jpg",
        "curtidas": 45,
        "criado_em": "2024-09-05T16:00:00.000-03:00",
        "atualizado_em": "2024-10-01T09:12:45.000-03:00",
        "comentarios": [
          {
            "id": 2,
            "usuario_id": 15,
            "texto": "Uau, códigos incríveis!",
            "criado_em": "2024-09-06T10:30:00.000-03:00"
          }
        ]
      },
      {
        "id": 4,
        "usuario_id": 3,
        "titulo": "Código do Dia",
        "descricao": "Códigozinho receita de pizza.",
        "imagem": "receita_pizza.jpg",
        "curtidas": 27,
        "criado_em": "2024-08-20T18:45:30.000-03:00",
        "atualizado_em": "2024-09-10T11:22:10.000-03:00",
        "comentarios": []
      },
      {
        "id": 5,
        "usuario_id": 9,
        "titulo": "Jornada Dev",
        "descricao": "Meu progresso em busca de um estilo de dev mais saudável.",
        "imagem": "progresso_fitness.jpg",
        "curtidas": 65,
        "criado_em": "2024-07-10T14:10:20.000-03:00",
        "atualizado_em": "2024-07-15T09:00:00.000-03:00",
        "comentarios": [
          {
            "id": 3,
            "usuario_id": 2,
            "texto": "Continue assim! Você é inspirador.",
            "criado_em": "2024-07-11T17:45:00.000-03:00"
          }
        ]
      }
    ]
  }
  ```

- **Obter detalhes do momento**

  - **Método:** `GET`
  - **Endpoint:** `/moments/:id`
    ```json
    {
      "data": {
        "id": 1,
        "user_id": 5,
        "title": "Meu primeiro Bug ",
        "description": "Nossa pessoal voces acreditam que esse foi meu primeiro bug que tava estranho. ",
        "image": "e51f921e-f51f-4850-a889-e59b661c0ac3.jpg",
        "likes_count": 0,
        "created_at": "2024-11-28T23:03:11.000-03:00",
        "updated_at": "2024-11-28T23:03:11.000-03:00",
        "user": {
          "id": 5,
          "username": "teste28nov",
          "email": "teste28nov@email.com",
          "password": "$argon2id$v=19$t=3,m=4096,p=1$eRZM+PXYymQ26+w+u/wg7Q$5+O1oW/oeKeE/AePX5OQsj4JfF6DYvIOzX7XcKxqgpk",
          "photo": null,
          "is_admin": 0,
          "created_at": "2024-11-28T00:57:53.000-03:00",
          "updated_at": "2024-11-28T00:57:53.000-03:00"
        },
        "comments": []
      }
    }
    ```

- **Atualizar momento**

  - **Método:** `PUT`
  - **Endpoint:** `/moments/:id`
  - **Corpo da Requisição:**
    ```json
    {
      "title": "Novo Título",
      "description": "Novo Conteúdo",
      "image": "url"
    }
    ```
  - **Resposta da Requisição:**
    ```json
    {
      "message": "Momento atualizado com sucesso!",
      "data": {
        "id": 1,
        "user_id": 5,
        "image": "e51f921e-f51f-4850-a889-e59b661c0ac3.jpg",
        "likes_count": 0,
        "created_at": "2024-11-28T23:03:11.000-03:00",
        "updated_at": "2025-01-19T22:51:45.249-03:00"
      }
    }
    ```

- **Deletar momento**

  - **Método:** `DELETE`
  - **Endpoint:** `/moments/:id`
  - **Resposta da Requisição:**

  ```json
  {
    "message": "Momento excluído com sucesso!",
    "data": {
      "id": 1,
      "user_id": 5,
      "title": "Meu primeiro Bug ",
      "description": "Nossa pessoal voces acreditam que esse foi meu primeiro bug que tava estranho. ",
      "image": "e51f921e-f51f-4850-a889-e59b661c0ac3.jpg",
      "likes_count": 0,
      "created_at": "2024-11-28T23:03:11.000-03:00",
      "updated_at": "2025-01-19T22:51:45.000-03:00"
    }
  }
  ```

## Tecnologias Utilizadas

- **TypeScript**
- **AdonisJS**
- **Postgress**
- **SQLite**

## Licença

Este projeto não possui uma licença especificada. Sinta-se à vontade para contribuir, mas verifique defitivamente está proíbido o seu uso comercial.

# Installation

There are currently two components to a CellarBoss installation:

1.  **CellarBoss backend** - The backend API server which interacts with your chosen database
2.  **CellarBoss web** - The web interface through which you can access all features

In future, there are plans for mobile & tablet user interfaces as well.

## Docker

It is recommended to run CellarBoss through the provided Docker images.

```
version: "3.7"

services:
  backend:
    image: ghcr.io/cellarboss/cellarboss-backend:latest
    environment:
      - BETTER_AUTH_SECRET=<super-secret-password>
      - BETTER_AUTH_URL=http://localhost:3000
      - DATABASE_TYPE=sqlite
      - DATABASE_URL=/config/cellarboss.sqlite
      - NODE_ENV=production
      - CORS=http://localhost:3000
      - UPLOAD_DIR=/uploads
    volumes:
      - ./data:/config
      - ./uploads:/uploads
    restart: unless-stopped
    networks:
      - internal

  web:
    image: ghcr.io/cellarboss/cellarboss-web:latest
    environment:
      - CELLARBOSS_SERVER=http://backend:5000
      - BETTER_AUTH_SECRET=<super-secret-password>
      - BETTER_AUTH_URL=http://backend:5000
    restart: unless-stopped
    networks:
      - internal

networks:
  internal:
```

You can then access CellarBoss by navigating to `http://localhost:3000`

::: info
You should replace the `BETTER_AUTH_SECRET` variable with a secure password, such as the output of `openssl rand -base64 32`
:::

## Reverse Proxy

If you wish to configure a reverse proxy, note that the `CORS` environment variable will need to be set to the domain you're accessing CellarBoss at.

## Database

CellarBoss supports three database engines: **SQLite**, **PostgreSQL**, and **MySQL**. Set the `DATABASE_TYPE` and `DATABASE_URL` environment variables on the backend container to configure your chosen engine.

| Engine     | `DATABASE_TYPE` | `DATABASE_URL` example                      |
| ---------- | --------------- | ------------------------------------------- |
| SQLite     | `sqlite`        | `/config/cellarboss.sqlite`                 |
| PostgreSQL | `postgres`      | `postgresql://user:pass@db:5432/cellarboss` |
| MySQL      | `mysql`         | `mysql://user:pass@db:3306/cellarboss`      |

### SQLite

SQLite is the simplest option — no additional services are required. Ensure the `DATABASE_URL` path points to a directory which is persisted between Docker restarts, as in the example above.

### PostgreSQL

To use PostgreSQL, add a PostgreSQL service to your Docker Compose file and point the backend at it:

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: cellarboss
      POSTGRES_PASSWORD: <your-db-password>
      POSTGRES_DB: cellarboss
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    image: ghcr.io/cellarboss/cellarboss-backend:latest
    environment:
      DATABASE_TYPE: postgres
      DATABASE_URL: postgresql://cellarboss:<your-db-password>@db:5432/cellarboss
      # ... other env vars as above
    depends_on:
      - db

volumes:
  pgdata:
```

### MySQL

To use MySQL, add a MySQL service to your Docker Compose file and point the backend at it:

```yaml
services:
  db:
    image: mysql:9
    environment:
      MYSQL_ROOT_PASSWORD: <your-root-password>
      MYSQL_USER: cellarboss
      MYSQL_PASSWORD: <your-db-password>
      MYSQL_DATABASE: cellarboss
    volumes:
      - mysqldata:/var/lib/mysql
    restart: unless-stopped

  backend:
    image: ghcr.io/cellarboss/cellarboss-backend:latest
    environment:
      DATABASE_TYPE: mysql
      DATABASE_URL: mysql://cellarboss:<your-db-password>@db:3306/cellarboss
      # ... other env vars as above
    depends_on:
      - db

volumes:
  mysqldata:
```

## First Run

When CellarBoss backend is run for the first time, your chosen database will be seeded with a default user, and some initial data.
See [Authentication](/guide/authentication) for details on how to log in.

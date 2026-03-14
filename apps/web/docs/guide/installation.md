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
    volumes:
      - ./data:/config
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

Currently, only `sqlite` databases are supported, with additional database engine support on the roadmap.

You should ensure that the `DATABASE_URL` path points to a directory which is persisted between Docker restarts, as in the example above.

## First Run

When CellarBoss backend is run for the first time, your chosen database will be seeded with a default user, and some initial data.
See [Authentication](/guide/authentication) for details on how to log in.

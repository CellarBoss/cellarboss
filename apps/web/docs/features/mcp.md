# MCP Server

CellarBoss can optionally expose your cellar data to AI assistants over the [Model Context Protocol](https://modelcontextprotocol.io) (MCP), so you can ask an assistant questions about your cellar in natural language — for example "what reds do I have that are ready to drink?" or "what's the average score I've given wines from Barossa Valley?".

::: warning Trusted networks only
The MCP server has **no authentication** and is **read-only**. It's intended for trusted, internal-network use — for example a self-hosted AI assistant running alongside CellarBoss. Do not expose it over the public internet.
:::

## Enabling the MCP Server

Set the `MCP_ENABLED` environment variable to `true` on the **backend** container:

```yaml
services:
  backend:
    image: ghcr.io/cellarboss/cellarboss-backend:latest
    environment:
      - MCP_ENABLED=true
      # ... other env vars, see Installation
```

Once enabled, the server is available at `/mcp` on your backend (e.g. `http://backend:5000/mcp`).

## Connecting a Client

Any MCP client that supports the Streamable HTTP transport can connect directly to the `/mcp` endpoint. Consult your client's documentation for the exact configuration syntax — most accept a server URL along the lines of:

```json
{
  "mcpServers": {
    "cellarboss": {
      "url": "http://localhost:5000/mcp"
    }
  }
}
```

## Available Tools

All tools are read-only and return JSON.

### Wines

| Tool         | Description                                                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `list_wines` | Lists every [wine](/resources/wines), one row per [vintage](/resources/vintages), with winemaker, region/country, grape varieties, drinking window, bottle counts by status, and a tasting note average score/count |
| `get_wine`   | Gets a single wine at a specific vintage, with the same details as `list_wines`                                                                                                                                     |

### Bottles

| Tool           | Description                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `list_bottles` | Lists every [bottle](/resources/bottles) in the cellar, with the wine/vintage it holds and its resolved storage location embedded |
| `get_bottle`   | Gets a single bottle by id, with the same details as `list_bottles`                                                               |

### Storages and Locations

| Tool             | Description                                     |
| ---------------- | ----------------------------------------------- |
| `list_storages`  | Lists every [storage](/resources/storages) unit |
| `get_storage`    | Gets a single storage unit by id                |
| `list_locations` | Lists every [location](/resources/locations)    |
| `get_location`   | Gets a single location by id                    |

### Tasting Notes

| Tool                            | Description                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| `list_tasting_notes`            | Lists every [tasting note](/resources/tasting-notes) across the whole cellar            |
| `get_tasting_note`              | Gets a single tasting note by id                                                        |
| `get_tasting_notes_for_vintage` | Lists tasting notes for a specific vintage (by vintage id, as returned by `list_wines`) |
| `get_tasting_notes_for_wine`    | Lists tasting notes across every vintage of a wine (by wine id)                         |

::: info
Tasting note text is deliberately left out of `list_wines`/`get_wine` — only the average score and note count are included there. An assistant needs to call one of the tasting note tools to read the actual note content.
:::

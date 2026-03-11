# Wines

Wines are the core entity in CellarBoss. Each wine has a name, type, and is associated with a [winemaker](/resources/winemakers) and [region](/resources/regions).

## List View

![Wines list](/screenshots/wines-list.png)

### Columns

| Column    | Description                       |
| --------- | --------------------------------- |
| Name      | The wine's name                   |
| Type      | Red, white, rosé, sparkling, etc. |
| Winemaker | The producer of this wine         |
| Region    | The wine-growing region           |

### Filtering

Filter wines by type, winemaker, or region using the multi-select filters above the table.

![Wines filtered](/screenshots/wines-filter.png)

## Creating a Wine

Click **Create** to add a new wine.

![Create wine](/screenshots/wines-create.png)

### Fields

| Field     | Required | Description                                                             |
| --------- | -------- | ----------------------------------------------------------------------- |
| Name      | Yes      | The wine's name                                                         |
| Type      | Yes      | Wine type (red, white, rosé, sparkling, etc.)                           |
| Winemaker | Yes      | The producer — select from existing [winemakers](/resources/winemakers) |
| Region    | Yes      | The wine region — select from existing [regions](/resources/regions)    |

## Viewing a Wine

Click any row to view the wine's details, including associated vintages and bottles.

![Wine detail](/screenshots/wines-detail.png)

## Editing a Wine

From the detail view, click **Edit** to modify the wine's information.

![Edit wine](/screenshots/wines-edit.png)

## Deleting a Wine

::: warning
Deleting a wine will also remove all associated vintages and bottles. This action cannot be undone.
:::

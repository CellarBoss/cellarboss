# Wines

Wines are the core entity in CellarBoss. Each wine has a name, type, and is associated with a [winemaker](/resources/winemakers) and [region](/resources/regions).

## List View

![Wines list](/screenshots/wines-list.png)

### Columns

| Column                  | Description                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------- |
| Name                    | The wine's name                                                                       |
| Type (colour indicator) | Red, white, rosé, sparkling, etc.                                                     |
| Winemaker               | The producer of this wine                                                             |
| Region                  | The wine-growing region                                                               |
| Actions                 | Shortcut buttons for common actions. Hover over the icon to see what each button does |

### Filtering

Filter wines by type, winemaker, or region using the multi-select filters above the table.

![Wines filtered](/screenshots/wines-filter.png)

## Creating a Wine

Click **Create new Wine** to add a new wine.

![Create wine](/screenshots/wines-create.png)

### Fields

| Field     | Required | Description                                                             |
| --------- | -------- | ----------------------------------------------------------------------- |
| Name      | Yes      | The wine's name                                                         |
| Type      | Yes      | Wine type (red, white, rosé, sparkling, etc.)                           |
| Winemaker | Yes      | The producer — select from existing [winemakers](/resources/winemakers) |
| Region    | Yes      | The wine region — select from existing [regions](/resources/regions)    |

## Viewing a Wine

Click the name of the wine to view the wine's details.

![Wine detail](/screenshots/wines-detail.png)

## Editing a Wine

Click the **Edit** button to modify the wine's information.

![Edit wine](/screenshots/wines-edit.png)

## Deleting a Wine

Click the **Delete** button to remove the wine. You will be asked to confirm before deletion.

::: warning
Deleting a wine will also remove all associated vintages and bottles. This action cannot be undone.
:::

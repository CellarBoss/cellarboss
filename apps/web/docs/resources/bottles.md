# Bottles

Bottles represent individual physical bottles in your cellar. Each bottle is linked to a specific [vintage](/resources/vintages) and stored in a [storage location](/resources/storages).

## List View

The bottles page shows all bottles in a searchable, filterable data table.

![Bottles list](/screenshots/bottles-list.png)

### Columns

| Column         | Description                                     |
| -------------- | ----------------------------------------------- |
| Wine           | The name of the wine this bottle belongs to     |
| Vintage        | The year of the vintage                         |
| Storage        | The current storage location                    |
| Purchase Date  | When the bottle was purchased                   |
| Purchase Price | The price paid for the bottle                   |
| Status         | Current status (stored, consumed, gifted, etc.) |

### Filtering

Use the filter controls above the table to narrow results by status, wine type, or other attributes. See [DataTable Features](/features/datatable) for full details.

![Bottles filtered](/screenshots/bottles-filter.png)

## Creating a Bottle

Click the **Create** button to add a new bottle to your cellar.

![Create bottle](/screenshots/bottles-create.png)

### Fields

| Field          | Required | Description                                    |
| -------------- | -------- | ---------------------------------------------- |
| Vintage        | Yes      | Select the wine vintage this bottle belongs to |
| Storage        | Yes      | Where the bottle is stored                     |
| Purchase Date  | No       | When the bottle was purchased                  |
| Purchase Price | No       | Price paid for the bottle                      |

## Viewing a Bottle

Click any row in the table to view the bottle's full details.

![Bottle detail](/screenshots/bottles-detail.png)

## Editing a Bottle

From the detail view, click **Edit** to modify the bottle's information.

![Edit bottle](/screenshots/bottles-edit.png)

## Deleting a Bottle

From the detail or edit view, click **Delete** to remove the bottle. You will be asked to confirm before deletion.

::: warning
Deleting a bottle is permanent and cannot be undone.
:::

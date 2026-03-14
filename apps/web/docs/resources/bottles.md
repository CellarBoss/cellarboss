# Bottles

Bottles represent individual physical bottles in your cellar.

Before adding bottles, you must first create the associated [wine](/resources/wines) and [vintage](/resources/vintages).
Optionally, you can also create a [storage location](/resources/storages) to track where the bottle is located.

## List View

The bottles page shows all bottles in a searchable, filterable data table.

![Bottles list](/screenshots/bottles-list.png)

### Columns

| Column          | Description                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wine            | Shows the [wine](/resources/wines), [vintage](/resources/vintages) and [winemaker](/resources/winemakers)                                         |
| Drinking Window | Whether or not the [wine](/resources/wines) is within it's defined drinkable window (current date is after _drink from_ and before _drink until_) |
| Purchase Date   | When the bottle was purchased                                                                                                                     |
| Price           | The price paid for the bottle                                                                                                                     |
| Storage         | The current [storage](/resources/storages) location                                                                                               |
| Location        | The [location](/resources/locations) in which this bottle is stored                                                                               |
| Status          | Current status (stored, consumed, gifted, etc.)                                                                                                   |
| Actions         | Shortcut buttons for common actions. Hover over the icon to see what each button does                                                             |

### Filtering

Use the filter controls above the table to narrow results by status, wine type, or other attributes. See [DataTable Features](/features/datatable) for full details.

![Bottles filtered](/screenshots/bottles-filter.png)

## Creating a Bottle

Click the **Create new Bottle** button to add a new bottle to your cellar.

![Create bottle](/screenshots/bottles-create.png)

### Fields

| Field          | Required | Description                                                                             |
| -------------- | -------- | --------------------------------------------------------------------------------------- |
| Vintage        | Yes      | Select the wine vintage this bottle belongs to                                          |
| Storage        | Yes      | Where the bottle is stored                                                              |
| Status         | Yes      | The current status of the bottle (_ordered_, _drunk_ etc)                               |
| Purchase Date  | No       | When the bottle was purchased                                                           |
| Purchase Price | No       | Price paid for the bottle                                                               |
| Quantity       | Yes      | Create _n_ identical bottles with these details. Useful when an entire case is ordered! |

## Viewing a Bottle

Click the **View** button to view the bottle's full details.

![Bottle detail](/screenshots/bottles-detail.png)

## Editing a Bottle

Click the **Edit** button to modify the bottle's information.

![Edit bottle](/screenshots/bottles-edit.png)

## Deleting a Bottle

Click the **Delete** button to remove the bottle. You will be asked to confirm before deletion.

::: warning
Deleting a bottle is permanent and cannot be undone.
:::

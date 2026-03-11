# Storages

Storages represent physical storage units within a [location](/resources/locations) — such as racks, shelves, bins, or sections. Storages support a parent-child hierarchy, allowing you to model nested structures like Room > Rack > Shelf.

## List View

![Storages list](/screenshots/storages-list.png)

### Columns

| Column   | Description                                                          |
| -------- | -------------------------------------------------------------------- |
| Name     | The storage unit name                                                |
| Location | The physical location this storage belongs to                        |
| Parent   | The parent storage (if nested) — displayed as a breadcrumb hierarchy |

For more on how the hierarchy display works, see [Storage Hierarchy](/features/storage-hierarchy).

## Creating a Storage

Click **Create** to add a new storage unit.

![Create storage](/screenshots/storages-create.png)

### Fields

| Field    | Required | Description                                   |
| -------- | -------- | --------------------------------------------- |
| Name     | Yes      | The storage unit name                         |
| Location | Yes      | The physical location this storage belongs to |
| Parent   | No       | An optional parent storage for nesting        |

## Viewing a Storage

Click any row to view the storage's details and the bottles it contains.

![Storage detail](/screenshots/storages-detail.png)

## Editing a Storage

From the detail view, click **Edit** to modify the storage's information.

## Deleting a Storage

::: warning
A storage cannot be deleted if it contains bottles or has child storages. Move or remove them first.
:::

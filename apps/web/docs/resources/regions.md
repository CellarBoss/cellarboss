# Regions

Regions represent wine-producing areas within a [country](/resources/countries). Wines are associated with a region to track their origin.

## List View

![Regions list](/screenshots/regions-list.png)

### Columns

| Column  | Description                        |
| ------- | ---------------------------------- |
| Name    | The region name                    |
| Country | The country this region belongs to |

## Creating a Region

Click **Create** to add a new region.

![Create region](/screenshots/regions-create.png)

::: info
Region names must be unique within their [country](/resources/countries)
:::

### Fields

| Field   | Required | Description                        |
| ------- | -------- | ---------------------------------- |
| Name    | Yes      | The region name                    |
| Country | Yes      | The country this region belongs to |

## Viewing a Region

Click the name of the region to view the region's details and associated wines.

![Region detail](/screenshots/regions-detail.png)

## Editing a Region

Click the **Edit** button to modify the region's information.

## Deleting a Region

Click the **Delete** button to remove the region. You will be asked to confirm before deletion.

::: warning
A region cannot be deleted if it has associated wines. Remove or reassign the wines first.
:::

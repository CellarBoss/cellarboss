# Vintages

A vintage represents a specific year's production of a [wine](/resources/wines). Each vintage can have a drinking window (drink from / drink until) to track optimal consumption timing.

## Accessing Vintages

Vintages do not have a dedicated list page. Instead, they are accessed through the [wine detail page](/resources/wines) — each wine shows its associated vintages. You can also create a vintage directly from the wine detail view.

## Creating a Vintage

Navigate to the create vintage page, or click **Create Vintage** from a wine's detail view.

![Create vintage](/screenshots/vintages-create.png)

### Fields

| Field       | Required | Description                        |
| ----------- | -------- | ---------------------------------- |
| Wine        | Yes      | The wine this vintage belongs to   |
| Year        | Yes      | The vintage year                   |
| Drink From  | No       | Earliest recommended year to drink |
| Drink Until | No       | Latest recommended year to drink   |

## Viewing a Vintage

Click any row to view the vintage's details and associated bottles.

![Vintage detail](/screenshots/vintages-detail.png)

## Editing a Vintage

From the detail view, click **Edit** to modify the vintage's information.

## Deleting a Vintage

::: warning
Deleting a vintage will also remove all associated bottles. This action cannot be undone.
:::

# DataTable Features

Most resource pages in CellarBoss display data in an interactive table with search, filtering, sorting, pagination, and bulk actions.

## Search

Type in the search box above the table to filter rows by text content. The search query is stored in the URL, so you can bookmark or share filtered views.

![DataTable search](/screenshots/datatable-search.png)

## Filtering

Click the filter buttons above the table to open multi-select filter dropdowns. Select one or more values to narrow the displayed results. Active filters are shown as badges.

![DataTable filters](/screenshots/datatable-filter.png)

Some filters display options in groups. For example, the wines table groups winemaker options by country.

## Sorting

Click any column header to sort by that column. Click again to reverse the sort order. A sort indicator appears next to the active column header.

## Pagination

Use the pagination controls at the bottom of the table to navigate between pages. The page size and current page are stored in the URL.

## Bulk Actions

Select multiple rows using the checkboxes on the left side of the table. When rows are selected, bulk action buttons appear above the table.

![DataTable bulk selection](/screenshots/datatable-bulk.png)

## Row Actions

Each row may have action buttons on the right side for quick access to view, edit, or delete operations.

## URL State

All table state — search text, active filters, current page, and page size — is stored in the URL using query parameters. This means:

- You can bookmark a filtered view and return to it later
- You can share a link to a specific filtered view with other users
- Browser back/forward navigation works with table state changes

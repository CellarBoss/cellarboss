import { useState, useCallback } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import { Searchbar, Text, IconButton, Menu } from "react-native-paper";
import { Swipeable } from "react-native-gesture-handler";
import { FilterSheet, type FilterConfig } from "./FilterSheet";
import { EmptyState } from "./EmptyState";
import { theme } from "@/lib/theme";
import type { SelectOption } from "@/lib/types/field";

type SortOption = {
  label: string;
  value: string;
};

type DataListFilterConfig<T> = {
  key: string;
  label: string;
  options: SelectOption[];
  multiple?: boolean;
  predicate: (item: T, selectedValues: string[]) => boolean;
};

type SwipeAction = {
  icon: string;
  color: string;
  onPress: () => void;
};

type DataListProps<T> = {
  data: T[];
  renderItem: (item: T) => React.ReactElement;
  keyExtractor: (item: T) => string;
  searchPlaceholder?: string;
  searchFilter?: (item: T, query: string) => boolean;
  sortOptions?: SortOption[];
  onSort?: (value: string) => void;
  currentSort?: string;
  filterConfigs?: DataListFilterConfig<T>[];
  swipeActions?: (item: T) => SwipeAction[];
  onRefresh?: () => void;
  refreshing?: boolean;
  emptyIcon?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  ListHeaderComponent?: React.ReactElement;
};

export function DataList<T>({
  data,
  renderItem,
  keyExtractor,
  searchPlaceholder = "Search...",
  searchFilter,
  sortOptions,
  onSort,
  currentSort,
  filterConfigs,
  swipeActions,
  onRefresh,
  refreshing = false,
  emptyIcon,
  emptyTitle = "No items",
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  ListHeaderComponent,
}: DataListProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>(
    () => {
      const initial: Record<string, string[]> = {};
      filterConfigs?.forEach((c) => (initial[c.key] = []));
      return initial;
    },
  );

  let filteredData = data;

  if (searchFilter && searchQuery) {
    filteredData = filteredData.filter((item) =>
      searchFilter(item, searchQuery),
    );
  }

  if (filterConfigs) {
    for (const config of filterConfigs) {
      const selected = filterValues[config.key];
      if (selected && selected.length > 0) {
        filteredData = filteredData.filter((item) =>
          config.predicate(item, selected),
        );
      }
    }
  }

  const renderSwipeableItem = useCallback(
    ({ item }: { item: T }) => {
      const actions = swipeActions?.(item);

      if (!actions || actions.length === 0) {
        return renderItem(item);
      }

      return (
        <Swipeable
          renderRightActions={() => (
            <View style={styles.swipeActions}>
              {actions.map((action, i) => (
                <IconButton
                  key={i}
                  icon={action.icon}
                  iconColor="#fff"
                  containerColor={action.color}
                  size={20}
                  onPress={action.onPress}
                />
              ))}
            </View>
          )}
        >
          {renderItem(item)}
        </Swipeable>
      );
    },
    [renderItem, swipeActions],
  );

  const currentSortLabel = sortOptions?.find(
    (o) => o.value === currentSort,
  )?.label;

  const sheetFilters: FilterConfig[] | undefined = filterConfigs?.map((c) => ({
    key: c.key,
    label: c.label,
    options: c.options,
    multiple: c.multiple ?? true,
  }));

  return (
    <View style={styles.container}>
      {(searchFilter || sortOptions || filterConfigs) && (
        <View style={styles.toolbar}>
          {searchFilter && (
            <Searchbar
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchbar}
            />
          )}
          {sheetFilters && sheetFilters.length > 0 && (
            <FilterSheet
              filters={sheetFilters}
              values={filterValues}
              onChange={setFilterValues}
            />
          )}
          {sortOptions && onSort && (
            <Menu
              visible={sortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <IconButton
                  icon="sort"
                  size={24}
                  onPress={() => setSortMenuVisible(true)}
                />
              }
            >
              {sortOptions.map((option) => (
                <Menu.Item
                  key={option.value}
                  title={option.label}
                  onPress={() => {
                    onSort(option.value);
                    setSortMenuVisible(false);
                  }}
                  leadingIcon={
                    currentSort === option.value ? "check" : undefined
                  }
                />
              ))}
            </Menu>
          )}
        </View>
      )}

      {currentSortLabel && (
        <Text style={styles.sortIndicator}>Sorted by: {currentSortLabel}</Text>
      )}

      <FlatList
        data={filteredData}
        renderItem={renderSwipeableItem}
        keyExtractor={keyExtractor}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            message={emptyMessage}
            actionLabel={emptyActionLabel}
            onAction={onEmptyAction}
          />
        }
        contentContainerStyle={
          filteredData.length === 0 ? styles.emptyContainer : styles.list
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  searchbar: {
    flex: 1,
    height: 40,
  },
  sortIndicator: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  list: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  swipeActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 4,
  },
});

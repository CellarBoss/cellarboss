export type MultiSelectOption = { value: string; label: string };
export type MultiSelectOptionGroup = {
  group: string;
  options: MultiSelectOption[];
};

export type FlatMultiSelectFilterDef = {
  type: "multiselect";
  columnId: string;
  label: string;
  urlParamName?: string;
  options: MultiSelectOption[];
  sort?: (options: MultiSelectOption[]) => MultiSelectOption[];
};

export type GroupedMultiSelectFilterDef = {
  type: "grouped-multiselect";
  columnId: string;
  label: string;
  urlParamName?: string;
  options: MultiSelectOptionGroup[];
  sort?: (options: MultiSelectOptionGroup[]) => MultiSelectOptionGroup[];
};

export type MultiSelectFilterDef =
  | FlatMultiSelectFilterDef
  | GroupedMultiSelectFilterDef;

import { type FilterUrlHandler } from "../DataTableFilterControl";

export const multiSelectUrlHandler: FilterUrlHandler = {
  serialize(paramName, value, params) {
    const val = value as string[] | undefined;
    if (val?.length) {
      params.set(paramName, val.join(','));
    } else {
      params.delete(paramName);
    }
  },
  deserialize(paramName, searchParams) {
    const param = searchParams.get(paramName);
    return param ? param.split(',') : null;
  },
};

export type MultiSelectOption = { value: string; label: string };
export type MultiSelectOptionGroup = { group: string; options: MultiSelectOption[] };

export type FlatMultiSelectFilterDef = {
  type: "multiselect";
  columnId: string;
  label: string;
  urlParamName?: string;
  options: MultiSelectOption[];
};

export type GroupedMultiSelectFilterDef = {
  type: "grouped-multiselect";
  columnId: string;
  label: string;
  urlParamName?: string;
  options: MultiSelectOptionGroup[];
};

export type MultiSelectFilterDef = FlatMultiSelectFilterDef | GroupedMultiSelectFilterDef;

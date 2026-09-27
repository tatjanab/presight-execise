import { useId } from "react";
import {
  SORT_FIELDS,
  type SortField,
  type SortOrder,
} from "../directoryState";
import { fieldControl, fieldLabel } from "./styles";

const SORT_LABELS: Record<SortField, string> = {
  first_name: "First name",
  last_name: "Last name",
  age: "Age",
  nationality: "Nationality",
};

type SortControlsProps = {
  sort: SortField;
  order: SortOrder;
  onChange: (patch: { sort?: SortField; order?: SortOrder }) => void;
};

const selectClassName = `${fieldControl} cursor-pointer px-3`;

export function SortControls({ sort, order, onChange }: SortControlsProps) {
  const sortId = useId();
  const orderId = useId();

  return (
    <div className="grid grid-cols-2 gap-3 lg:w-80">
      <div>
        <label htmlFor={sortId} className={fieldLabel}>
          Sort
        </label>
        <select
          id={sortId}
          value={sort}
          onChange={(event) =>
            onChange({ sort: event.target.value as SortField })
          }
          className={selectClassName}
        >
          {SORT_FIELDS.map((field) => (
            <option key={field} value={field}>
              {SORT_LABELS[field]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={orderId} className={fieldLabel}>
          Direction
        </label>
        <select
          id={orderId}
          value={order}
          onChange={(event) =>
            onChange({ order: event.target.value as SortOrder })
          }
          className={selectClassName}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
}

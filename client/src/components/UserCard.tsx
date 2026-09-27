export type UserCardProps = {
  avatar: string;
  first_name: string;
  last_name: string;
  nationality: string;
  age: number;
  hobbies: string[];
};

const VISIBLE_HOBBIES = 2;

// Full class names so Tailwind can find them when scanning the source.
const CHIP_COLORS = [
  "bg-brand-100 text-brand-800 ring-brand-200",
  "bg-emerald-100 text-emerald-800 ring-emerald-200",
  "bg-amber-100 text-amber-800 ring-amber-200",
  "bg-sky-100 text-sky-800 ring-sky-200",
  "bg-rose-100 text-rose-800 ring-rose-200",
  "bg-violet-100 text-violet-800 ring-violet-200",
  "bg-teal-100 text-teal-800 ring-teal-200",
  "bg-orange-100 text-orange-800 ring-orange-200",
];

function chipColor(hobby: string): string {
  let hash = 0;
  for (const char of hobby) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return CHIP_COLORS[Math.abs(hash) % CHIP_COLORS.length];
}

export function UserCard({
  avatar,
  first_name,
  last_name,
  nationality,
  age,
  hobbies,
}: UserCardProps) {
  const visibleHobbies = hobbies.slice(0, VISIBLE_HOBBIES);
  const remainingHobbyCount = hobbies.length - visibleHobbies.length;

  return (
    <article className="flex h-full min-w-0 gap-3 rounded-xl border border-brand-100 bg-white p-3.5 shadow-sm shadow-brand-900/5 transition hover:-translate-y-px hover:border-brand-300 hover:shadow-md hover:shadow-brand-900/10">
      <img
        src={avatar}
        alt=""
        className="size-12 shrink-0 rounded-full bg-brand-100 object-cover ring-2 ring-brand-200 ring-offset-2"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-semibold text-slate-900">
          {first_name} {last_name}
        </h3>
        <div className="mt-0.5 flex items-baseline justify-between gap-3 text-sm text-slate-500">
          <p className="truncate">{nationality}</p>
          <p
            className="shrink-0 font-semibold tabular-nums text-brand-700"
            aria-label={`${age} years old`}
          >
            {age}
          </p>
        </div>
        {visibleHobbies.length > 0 ? (
          <ul className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {visibleHobbies.map((hobby, index) => (
              <li
                key={`${hobby}-${index}`}
                className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${chipColor(hobby)}`}
              >
                {hobby}
              </li>
            ))}
            {remainingHobbyCount > 0 ? (
              <li className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                +{remainingHobbyCount}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

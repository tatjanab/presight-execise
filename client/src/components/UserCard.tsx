export type UserCardProps = {
  avatar: string;
  first_name: string;
  last_name: string;
  nationality: string;
  age: number;
  hobbies: string[];
};

const VISIBLE_HOBBIES = 2;

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
    <article className="flex h-full min-w-0 gap-3 rounded-lg border border-stone-200 bg-white p-3">
      <img
        src={avatar}
        alt=""
        className="size-12 shrink-0 rounded-full bg-stone-200 object-cover"
      />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium">
          {first_name} {last_name}
        </h3>
        <div className="mt-0.5 flex items-baseline justify-between gap-3 text-sm text-stone-600">
          <p className="truncate">{nationality}</p>
          <p className="shrink-0 tabular-nums" aria-label={`${age} years old`}>
            {age}
          </p>
        </div>
        {visibleHobbies.length > 0 ? (
          <ul className="mt-2 flex flex-wrap items-center gap-1.5">
            {visibleHobbies.map((hobby, index) => (
              <li
                key={`${hobby}-${index}`}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700"
              >
                {hobby}
              </li>
            ))}
            {remainingHobbyCount > 0 ? (
              <li className="text-xs font-medium text-stone-500">
                +{remainingHobbyCount}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

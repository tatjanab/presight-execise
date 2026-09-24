import { useQuery } from "@tanstack/react-query";
import { UserCard } from "./UserCard";

type User = {
  id: number;
  avatar: string;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
};

type UsersPage = {
  items: User[];
};

async function fetchUsers(): Promise<UsersPage> {
  const response = await fetch("/api/users?page=1");
  if (!response.ok) {
    throw new Error("Could not load people");
  }
  return response.json() as Promise<UsersPage>;
}

export function DirectoryView() {
  const users = useQuery({
    queryKey: ["users", { page: 1 }],
    queryFn: fetchUsers,
  });
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-stone-100 text-stone-900">
      <header className="shrink-0 border-b border-stone-200 bg-white px-4 py-4 sm:px-6">
        <h1 className="text-lg font-semibold tracking-tight">User directory</h1>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-xs font-medium text-stone-500">Search</p>
            <div
              aria-hidden="true"
              className="h-10 rounded-md border border-dashed border-stone-300 bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 lg:w-80">
            <div>
              <p className="mb-1.5 text-xs font-medium text-stone-500">Sort</p>
              <div
                aria-hidden="true"
                className="h-10 rounded-md border border-dashed border-stone-300 bg-white"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-medium text-stone-500">
                Direction
              </p>
              <div
                aria-hidden="true"
                className="h-10 rounded-md border border-dashed border-stone-300 bg-white"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside
          aria-label="Filters"
          className="flex max-h-[46%] min-h-0 shrink-0 flex-col border-b border-stone-200 bg-white md:max-h-none md:w-72 md:border-r md:border-b-0"
        >
          <section className="flex min-h-0 flex-1 flex-col border-b border-stone-200">
            <h2 className="shrink-0 px-4 py-3 text-sm font-semibold">
              Hobbies
            </h2>
            <div className="min-h-0 flex-1 overflow-y-auto" />
          </section>
          <section className="flex min-h-0 flex-1 flex-col">
            <h2 className="shrink-0 px-4 py-3 text-sm font-semibold">
              Nationalities
            </h2>
            <div className="min-h-0 flex-1 overflow-y-auto" />
          </section>
        </aside>

        <main className="min-h-0 flex-1 p-4 sm:p-6">
          <section
            aria-label="People"
            className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-stone-200 bg-white"
          >
            <h2 className="shrink-0 border-b border-stone-200 px-4 py-3 text-sm font-semibold">
              People
            </h2>
            <div className="grid min-h-0 flex-1 content-start grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-3 overflow-y-auto p-3">
              {users.isPending ? (
                <p className="px-1 py-2 text-sm text-stone-500">
                  Loading people…
                </p>
              ) : null}
              {users.isError ? (
                <p className="px-1 py-2 text-sm text-red-700" role="alert">
                  Could not load people.
                </p>
              ) : null}
              {users.data?.items.length === 0 ? (
                <p className="px-1 py-2 text-sm text-stone-500">
                  No people found.
                </p>
              ) : null}
              {users.data?.items.map((user) => (
                <UserCard key={user.id} {...user} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

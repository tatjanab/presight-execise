import { UserCard } from "./UserCard";

const avatar =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#57534e"/><text x="50%" y="54%" text-anchor="middle" font-size="28" fill="white" font-family="sans-serif">AL</text></svg>`
  );

export function DirectoryView() {
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
              <UserCard
                avatar={avatar}
                first_name="Ada"
                last_name="Lovelace"
                nationality="British"
                age={36}
                hobbies={[
                  "Reading",
                  "Mathematics",
                  "Music",
                  "Chess",
                  "Writing",
                ]}
              />
              <UserCard
                avatar={avatar}
                first_name="Grace"
                last_name="Hopper"
                nationality="American"
                age={85}
                hobbies={["Teaching", "Sailing"]}
              />
              <UserCard
                avatar={avatar}
                first_name="Alan"
                last_name="Turing"
                nationality="British"
                age={41}
                hobbies={["Computing", "Cryptography", "Mathematics"]}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

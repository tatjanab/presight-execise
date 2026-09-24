import { faker } from "@faker-js/faker";
import { closeDb, getDatabasePath, getDb } from "./db.js";

const USER_COUNT = 10_000;

const NATIONALITIES = [
  "American",
  "Australian",
  "Brazilian",
  "British",
  "Canadian",
  "Chinese",
  "Dutch",
  "Egyptian",
  "Emirati",
  "Filipino",
  "French",
  "German",
  "Greek",
  "Indian",
  "Italian",
  "Japanese",
  "Korean",
  "Mexican",
  "Nigerian",
  "Polish",
  "Serbian",
  "Spanish",
  "Swedish",
  "Turkish",
];

const HOBBIES = [
  "Astronomy",
  "Baking",
  "Birdwatching",
  "Board games",
  "Boxing",
  "Calligraphy",
  "Camping",
  "Chess",
  "Climbing",
  "Coding",
  "Cooking",
  "Cycling",
  "Dancing",
  "Drawing",
  "Fishing",
  "Football",
  "Gaming",
  "Gardening",
  "Hiking",
  "Knitting",
  "Martial arts",
  "Movies",
  "Music",
  "Padel",
  "Painting",
  "Photography",
  "Podcasts",
  "Pottery",
  "Reading",
  "Running",
  "Singing",
  "Skateboarding",
  "Skiing",
  "Surfing",
  "Swimming",
  "Tennis",
  "Travel",
  "Volunteering",
  "Writing",
  "Yoga",
];

const db = getDb();

// 1. Fresh schema (child table dropped first because of foreign keys)
db.exec(`
  DROP TABLE IF EXISTS user_hobbies;
  DROP TABLE IF EXISTS hobbies;
  DROP TABLE IF EXISTS users;

  CREATE TABLE users (
    id          INTEGER PRIMARY KEY,
    avatar      TEXT    NOT NULL,
    first_name  TEXT    NOT NULL,
    last_name   TEXT    NOT NULL,
    age         INTEGER NOT NULL,
    nationality TEXT    NOT NULL
  );

  CREATE TABLE hobbies (
    id   INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE user_hobbies (
    user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hobby_id INTEGER NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, hobby_id)
  );
`);

// 2. Prepared statements, reused for every row
const insertHobby = db.prepare("INSERT INTO hobbies (name) VALUES (?)");
const insertUser = db.prepare(`
  INSERT INTO users (avatar, first_name, last_name, age, nationality)
  VALUES (?, ?, ?, ?, ?)
`);
const insertUserHobby = db.prepare(
  "INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)"
);

faker.seed(42); // same data on every run

// 3. All inserts in one transaction
db.exec("BEGIN");
try {
  const hobbyIds = HOBBIES.map((name) =>
    Number(insertHobby.run(name).lastInsertRowid)
  );

  for (let i = 0; i < USER_COUNT; i++) {
    const { lastInsertRowid } = insertUser.run(
      faker.image.avatar(),
      faker.person.firstName(),
      faker.person.lastName(),
      faker.number.int({ min: 18, max: 80 }),
      faker.helpers.arrayElement(NATIONALITIES)
    );

    const hobbyCount = faker.number.int({ min: 0, max: 10 });
    for (const hobbyId of faker.helpers.arrayElements(hobbyIds, hobbyCount)) {
      insertUserHobby.run(lastInsertRowid, hobbyId);
    }
  }

  db.exec("COMMIT");
} catch (error) {
  db.exec("ROLLBACK");
  closeDb();
  throw error;
}

// 4. Indexes after the data is in
db.exec(`
  CREATE INDEX idx_users_first_name  ON users(first_name, id);
  CREATE INDEX idx_users_last_name   ON users(last_name, id);
  CREATE INDEX idx_users_age         ON users(age, id);
  CREATE INDEX idx_users_nationality ON users(nationality, id);
  CREATE INDEX idx_user_hobbies_hobby ON user_hobbies(hobby_id, user_id);
`);

console.log(`Seeded ${USER_COUNT} users into ${getDatabasePath()}`);
closeDb();

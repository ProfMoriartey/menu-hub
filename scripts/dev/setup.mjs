// Throwaway local Postgres 16 + schema + .env.development.local.
// Safe to run twice: reuses the cluster and database, push is a no-op the second time.
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, chownSync } from "node:fs";
import { createServer } from "node:net";

const BIN = "/usr/lib/postgresql/16/bin";
const DATA = "/var/tmp/menu-hub-pg/data";
const RUN = "/var/tmp/menu-hub-pg/run";
const PORT_FILE = "/var/tmp/menu-hub-pg/port";
const DB = "menu_hub";

if (!existsSync(`${BIN}/initdb`)) {
  console.error(`dev:setup needs Postgres 16 binaries in ${BIN} (initdb, pg_ctl, createdb). Install postgresql-16 and retry.`);
  process.exit(1);
}

// Everything Postgres runs as the postgres user (it refuses to run as root).
const asPg = (cmd, args, opts = {}) => {
  const me = process.getuid?.() === 0 ? ["runuser", ["-u", "postgres", "--", cmd, ...args]] : ["sudo", ["-n", "-u", "postgres", cmd, ...args]];
  return spawnSync(me[0], me[1], { encoding: "utf8", ...opts });
};
const pg = (cmd, args) => {
  const r = asPg(`${BIN}/${cmd}`, args);
  if (r.status !== 0) {
    console.error(`${cmd} failed:\n${r.stdout}${r.stderr}`);
    process.exit(1);
  }
  return r.stdout.trim();
};
const freePort = () =>
  new Promise((res) => {
    const s = createServer().listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => res(port));
    });
  });
const owner = () => {
  const r = spawnSync("id", ["-u", "postgres"], { encoding: "utf8" });
  if (r.status !== 0) { console.error("dev:setup needs a postgres system user."); process.exit(1); }
  return Number(r.stdout);
};

const uid = owner();
const gid = Number(execFileSync("id", ["-g", "postgres"], { encoding: "utf8" }));
for (const d of ["/var/tmp/menu-hub-pg", RUN]) {
  mkdirSync(d, { recursive: true });
  chownSync(d, uid, gid);
}

if (!existsSync(`${DATA}/PG_VERSION`)) {
  console.log("Creating cluster…");
  pg("initdb", ["-D", DATA, "-A", "trust", "-U", "postgres", "-E", "UTF8"]);
}

const running = asPg(`${BIN}/pg_ctl`, ["-D", DATA, "status"]).status === 0;
let port = existsSync(PORT_FILE) ? Number(readFileSync(PORT_FILE, "utf8")) : 0;
if (!running) {
  port = await freePort();
  writeFileSync(PORT_FILE, String(port));
  console.log(`Starting Postgres on port ${port}…`);
  pg("pg_ctl", ["-D", DATA, "-l", "/var/tmp/menu-hub-pg/log", "-w", "-o", `-p ${port} -k ${RUN} -c listen_addresses=127.0.0.1`, "start"]);
}

const psql = (sql) => pg("psql", ["-h", "127.0.0.1", "-p", String(port), "-U", "postgres", "-tAc", sql, "postgres"]);
if (!psql(`select 1 from pg_database where datname='${DB}'`)) psql(`create database ${DB}`);

const url = `postgres://postgres@127.0.0.1:${port}/${DB}`;
console.log("Pushing schema…");
const push = spawnSync("pnpm", ["exec", "drizzle-kit", "push", "--force"], {
  stdio: "inherit",
  env: { ...process.env, SKIP_ENV_VALIDATION: "1", DATABASE_URL: url },
});
if (push.status !== 0) process.exit(push.status ?? 1);

writeFileSync(
  ".env.development.local",
  [
    "SKIP_ENV_VALIDATION=1",
    "UPLOADTHING_TOKEN=dummy",
    "CLERK_SECRET_KEY=sk_test_x",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cy5kZXYk",
    `DATABASE_URL=${url}`,
    "",
  ].join("\n"),
);
console.log(`Ready. DATABASE_URL=${url}\nWrote .env.development.local`);

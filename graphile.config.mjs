// @ts-check
import { makePgService } from "@dataplan/pg/adaptors/pg";
import AmberPreset from "postgraphile/presets/amber";
import { makeV4Preset } from "postgraphile/presets/v4";
import { PostGraphileConnectionFilterPreset } from "postgraphile-plugin-connection-filter";
import { PgAggregatesPreset } from "@graphile/pg-aggregates";
import { PgManyToManyPreset } from "@graphile-contrib/pg-many-to-many";
// import { PgSimplifyInflectionPreset } from "@graphile/simplify-inflection";
import PersistedPlugin from "@grafserv/persisted";
import { PgOmitArchivedPlugin } from "@graphile-contrib/pg-omit-archived";
import { makePgSmartTagsFromFilePlugin } from "postgraphile/utils";

// For configuration file details, see: https://postgraphile.org/postgraphile/next/config

const __dirname = new URL(".", import.meta.url).pathname;

const TagsFilePlugin = makePgSmartTagsFromFilePlugin(
  // We're using JSONC for VSCode compatibility; also using an explicit file
  // path keeps the tests happy.
  `${__dirname}/tags.json5`
);

/** @satisfies {GraphileConfig.Preset} */
const preset = {
  extends: [
    AmberPreset.default ?? AmberPreset,
    makeV4Preset({
      /* Enter your V4 options here */
      graphiql: true,
      graphiqlRoute: "/",
    }),
    PostGraphileConnectionFilterPreset,
    PgManyToManyPreset,
    PgAggregatesPreset,
    // PgSimplifyInflectionPreset
  ],
  plugins: [PersistedPlugin.default, PgOmitArchivedPlugin, TagsFilePlugin,],
  pgServices: [
    makePgService({
      // Database connection string:
      connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
      // List of schemas to expose:
      schemas: process.env.DATABASE_SCHEMAS?.split(",") ?? ["public"],
      // Enable LISTEN/NOTIFY:
      pubsub: true,
    }),
  ],
  schema: {
    defaultBehavior: '-insert -update -delete',
  },
  grafserv: {
    port: 5678,
    websockets: true,
    allowUnpersistedOperation: true,
    watch: true
  },
  grafast: {
    explain: true,
  },
};

export default preset;

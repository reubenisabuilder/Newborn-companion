-- Optional tags on appointments, for recalling recurring concerns ("hip",
-- "feeding") across entries — precise counting via an explicit tag rather
-- than guessing from free-text notes. Small per-family data volume, same
-- as everything else here, so no GIN index: the app fetches a family's
-- appointments once and aggregates client/server-side, same pattern as
-- search and the activity feed.

alter table appointments add column tags text[] not null default '{}';

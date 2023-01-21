CREATE TABLE IF NOT EXISTS timers.timers
(
    duration integer,
    id character varying(255) COLLATE pg_catalog."default",
    description character varying(255) COLLATE pg_catalog."default",
    isactive character varying(255) COLLATE pg_catalog."default",
    start bigint,
    end_time bigint
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS timers.timers
    OWNER to postgres;
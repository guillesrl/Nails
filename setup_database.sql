-- Create the reservas table in the existing postgres database
CREATE TABLE IF NOT EXISTS "public"."reservas" (
  "id" SERIAL,
  "nombre" TEXT NULL,
  "email" TEXT NULL,
  "fecha" TIMESTAMP WITH TIME ZONE NULL,
  "evento" TEXT NULL,
  "creado" TIMESTAMP NULL DEFAULT now(),
  CONSTRAINT "reservas_pkey" PRIMARY KEY ("id")
);

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

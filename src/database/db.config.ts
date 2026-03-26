type DbEnvConfig = {
  host?: string;
  port?: string;
  user?: string;
  password?: string;
  database?: string;
};

function getDbEnvConfig(): DbEnvConfig {
  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };
}

export function getDbConnectionConfig(): {
  host?: string;
  port: number;
  username?: string;
  password?: string;
  database?: string;
} {
  const env = getDbEnvConfig();
  return {
    host: env.host,
    port: parseInt(env.port ?? '5432', 10),
    username: env.user,
    password: env.password,
    database: env.database,
  };
}

export function getPgPoolConfig(): {
  host?: string;
  port: number;
  user?: string;
  password?: string;
  database?: string;
} {
  const env = getDbEnvConfig();
  return {
    host: env.host,
    port: parseInt(env.port ?? '5432', 10),
    user: env.user,
    password: env.password,
    database: env.database,
  };
}

import { DataSource } from "typeorm"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "hascape",
    password: process.env.DB_PASSWORD || "hascape",
    database: process.env.DB_NAME || "hascape",
    synchronize: true,
    logging: false,
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: [],
})
 
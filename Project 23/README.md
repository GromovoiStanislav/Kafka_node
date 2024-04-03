## Real-time Data Processing with Express, Kafka and MySQL (JS)

```
npm run admin

npm run consumer

npm run producer
```

### MySQL queries for creating the database and the tables.

Create a database named <b>rail_data</b>

```sql
CREATE DATABASE IF NOT EXISTS rail_data;
```

Switch to <b>rail_data</b> database

```sql
USE rail_data;
```

Create <b>active_trains</b> table

```sql
CREATE TABLE IF NOT EXISTS active_trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id VARCHAR(255) NOT NULL,
    stanox VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Create <b>cancelled_trains</b> table

```sql
CREATE TABLE IF NOT EXISTS cancelled_trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id VARCHAR(255) NOT NULL,
    reason_code VARCHAR(255) NOT NULL,
    stanox VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

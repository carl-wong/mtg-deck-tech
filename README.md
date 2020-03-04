# MTG DeckTech

## Prepare SQL File

Run `npm run trim-oracle-db` to process the latest Scryfall Oracle JSON file (found [here](https://archive.scryfall.com/json/scryfall-oracle-cards.json)) by trimming off the unnecessary attributes.

Convert the output file into MySQL commands via a tool like [Numidian Convert](https://numidian.io/convert). `OracleCard` is the database table that will receive these records.

**Note:** MySQL may not support `VARCHAR(MAX)` column definitions in the `CREATE TABLE` command. Use the output from the trimming utility to determine an appropriate length for each column when setting up the database for the first time.

**Note:** Replace any table creation commands with `TRUNCATE OracleCard;` to empty and reseed the `OracleCard` table before inserting the new records.

## Upload SQL Insert File

- `scp local-file.sql [username]@[domain]:oracle-cards.sql` uploads the update file
- SSH into the server
- `mysqldump -u root -p [database] > backup.sql` to backup the database
- `mysql [database] < oracle-cards.sql` to execute the commands in the update file

## Working On MySQL

- SSH into the server
- `mysql` to start the MySQL prompt
- `SHOW DATABASES;` to list available databases
- `USE [database];` to select the database for the session
- `SHOW TABLES;` to list available tables

## Development Server

Run `json-server databases/min-oracle-server.json -p 3000` and `json-server databases/local.json -p 3001` to get the test APIs running.

Alternatively, launch the `mtg-deck-tech-api` Node project to launch a local copy of the API that connects to the remote MySQL database.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build For Production Prerequisites

You must also ensure the API URL uses HTTPS/SSL or else the requests to the back-end will not work. Set these accordingly in the `src/environments/environment.prod.ts` file before building.

## Build For Production

Run `ng build --prod` to build the project into `dist/deploy`.

## Prerequisites for Deployment

## Apache Deployment Prerequisites

Auth0 requires HTTPS/SSL for a production build to work. Ensure that a valid (i.e. not self-signed) SSL certificate is attached to the domain/subdomain where the app will be deployed.

Also ensure that `https://your-domain.com[/callback]` is correctly listed in Auth0's configuration for the various URLs that your deployment will contact for authentication.

## Apache Deployment

Upload the contents of `dist/deploy` to your `public_html/[root]` folder. Ensure `.htaccess` has the following rules:
```
RewriteEngine On
# If an existing asset or directory is requested go to it as it is
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
RewriteRule ^ - [L]
RewriteRule ^ /index.html
```

This ensures requests are redirected properly to Angular's files.
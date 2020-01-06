# MTG DeckTech

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
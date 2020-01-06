# MTG DeckTech

## Development Server

Run `json-server databases/min-oracle-server.json -p 3000` and `json-server databases/local.json -p 3001` to get the test APIs running.

Alternatively, launch the `mtg-deck-tech-api` Node project to launch a local copy of the API that connects to the remote MySQL database.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build For Production

Run `ng build --prod` to build the project into `dist/deploy`.

## Deployment

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
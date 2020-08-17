// intended for use with local express instance
export const environment = {
  production: false,
  defaultDecklist: '1 Alesha, Who Smiles at Death\n1 Altar of Dementia\n1 Animate Dead',
  baseHref: '/',
  auth0: {
  domain: 'johnnysasaki.auth0.com',
  client_id: '2RcQEkaXq2y2FrNcwMJY8YV5igue98hA',
  },
  apiUrl: 'https://scry-x.com/decktech-api',
  restdb: {
  url: 'https://scryx-338a.restdb.io/rest',
  mediaUrl: 'https://scryx-338a.restdb.io/media', // cannot use own domain for media archive
  cors_key: '5f3abaf4676d4003f08c2510',
  },
  timestamp: 'Updated: 2020-03-09 @ 16:51:10',
  version: 'LOCAL',
};

// intended for use with local express instance
export const environment = {
  apiUrl: 'https://scry-x.com/server',
  auth0: {
    client_id: '2RcQEkaXq2y2FrNcwMJY8YV5igue98hA',
    domain: 'johnnysasaki.auth0.com',
  },
  defaultDecklist: '1 Alesha, Who Smiles at Death\n1 Altar of Dementia\n1 Animate Dead',
  production: false,
  restdb: {
    cors_key: '5f3abaf4676d4003f08c2510',
    mediaUrl: 'https://scryx-338a.restdb.io/media', // cannot use own domain for media archive
    url: 'https://scryx-338a.restdb.io/rest',
  },
  timestamp: 'Updated: 2020-11-24 @ 08:22:39',
  version: 'LOCAL',
};

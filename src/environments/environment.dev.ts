export const environment = {
  apiUrl: 'https://scry-x.com/decktech-api',
  auth0: {
    client_id: '2RcQEkaXq2y2FrNcwMJY8YV5igue98hA',
    domain: 'johnnysasaki.auth0.com',
  },
  baseHref: '/decktech/',
  defaultDecklist: '1 Plains\n1 Island\n1 Swamp\n1 Mountain\n1 Forest\n1 Wastes',
  production: false,
  restdb: {
    cors_key: '5f3abaf4676d4003f08c2510',
		mediaUrl: 'https://scryx-338a.restdb.io/media', // cannot use own domain for media archive
    url: 'https://scryx-338a.restdb.io/rest',
	},
  timestamp: 'Updated: 2020-11-23 @ 19:01:01',
  version: 'DEV',
};

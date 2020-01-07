import { Auth0User } from './auth0-user';

describe('Auth0User', () => {
  it('should create an instance', () => {
	expect(new Auth0User()).toBeTruthy();
  });
});

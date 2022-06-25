describe('Stubsy', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/Stubsy/');
  });

  it('correctly set the default behaviour', () => {
    cy.request('http://localhost:3000/magazines').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.eq([
        { title: 'Divine reality' },
        { title: 'The sealed nectar' },
      ]);
    });
  });

  it(`should correctly use a pre-activated override`, () => {
    cy.request({
      url: 'http://localhost:3000/books',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(404);
      expect(response.body).to.deep.eq({ message: 'resource not found' });
    });
  });

  it(`should update an override through the UI`, () => {
    cy.get(`[data-testid="default"]`).click();

    cy.request('http://localhost:3000/books').then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.eq([
        { title: 'Divine reality' },
        { title: 'The sealed nectar' },
      ]);
    });
  });
});

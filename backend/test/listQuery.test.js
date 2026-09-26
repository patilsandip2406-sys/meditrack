const test = require('node:test');
const assert = require('node:assert/strict');
const ApiError = require('../utils/ApiError');
const { parseListQuery, collectionLinks, addResourceLinks } = require('../utils/listQuery');

const fields = { id: 'number', name: 'string', createdAt: 'date', tags: 'array' };

test('parses pagination, filters, sorting, and selected fields', () => {
  const result = parseListQuery({
    page: '2',
    limit: '10',
    'filter[name]': 'Ada',
    sort: '-createdAt,name',
    fields: 'name'
  }, { fields, searchFields: ['name'], defaultSort: 'id' });

  assert.equal(result.skip, 10);
  assert.equal(result.limit, 10);
  assert.deepEqual(result.where, { name: 'Ada' });
  assert.deepEqual(result.orderBy, [{ createdAt: 'desc' }, { name: 'asc' }]);
  assert.deepEqual(result.select, { name: true, id: true });

  const nestedFilter = parseListQuery({ filter: { name: 'Ada' } }, { fields });
  assert.deepEqual(nestedFilter.where, { name: 'Ada' });
});

test('rejects unsupported, unsafe query fields and invalid pagination', () => {
  assert.throws(() => parseListQuery({ sort: 'password' }, { fields }), ApiError);
  assert.throws(() => parseListQuery({ 'filter[password]': 'secret' }, { fields }), ApiError);
  assert.throws(() => parseListQuery({ 'filter[tags]': 'blue' }, { fields }), ApiError);
  assert.throws(() => parseListQuery({ limit: '101' }, { fields }), ApiError);
});

test('builds pagination and resource links', () => {
  const links = collectionLinks({ originalUrl: '/api/v1/patients?limit=10&search=Ada' }, 2, 3);
  assert.equal(links.self, '/api/v1/patients?limit=10&search=Ada&page=2');
  assert.equal(links.prev, '/api/v1/patients?limit=10&search=Ada&page=1');
  assert.equal(links.next, '/api/v1/patients?limit=10&search=Ada&page=3');

  assert.deepEqual(addResourceLinks('patients', [{ id: 7, name: 'Ada' }])[0]._links.self, {
    href: '/api/v1/patients/7'
  });
});

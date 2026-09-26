const ApiError = require('./ApiError');

const parseFilterValue = (value, type, field) => {
  if (typeof value !== 'string') throw new ApiError(400, `Invalid filter for ${field}`);
  if (type === 'number') {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) throw new ApiError(400, `Invalid filter for ${field}`);
    return parsed;
  }
  if (type === 'date') {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) throw new ApiError(400, `Invalid filter for ${field}`);
    return parsed;
  }
  return value;
};

const parseListQuery = (query, { fields, searchFields = [], defaultSort = 'id', searchType = 'contains' }) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new ApiError(400, 'page must be positive and limit must be between 1 and 100');
  }

  const where = {};
  const filters = query.filter && typeof query.filter === 'object' && !Array.isArray(query.filter)
    ? query.filter
    : Object.fromEntries(Object.entries(query)
      .flatMap(([key, value]) => {
        const match = key.match(/^filter\[([a-zA-Z][a-zA-Z0-9]*)\]$/);
        return match ? [[match[1], value]] : [];
      }));
  for (const [field, value] of Object.entries(filters)) {
    const type = fields[field];
    if (!type || type === 'array') throw new ApiError(400, `Filtering by ${field} is not supported`);
    where[field] = parseFilterValue(value, type, field);
  }

  if (query.search) {
    where.OR = searchFields.map((field) => ({ [field]: { contains: String(query.search), mode: 'insensitive' } }));
  }

  const sortFields = String(query.sort || defaultSort).split(',').filter(Boolean);
  const orderBy = sortFields.map((token) => {
    const descending = token.startsWith('-');
    const field = descending ? token.slice(1) : token;
    if (!fields[field] || fields[field] === 'array') throw new ApiError(400, `Sorting by ${field} is not supported`);
    return { [field]: descending ? 'desc' : 'asc' };
  });

  let select;
  if (query.fields) {
    const selectedFields = String(query.fields).split(',').filter(Boolean);
    if (!selectedFields.length || selectedFields.some((field) => !fields[field])) {
      throw new ApiError(400, 'fields contains an unsupported field');
    }
    select = Object.fromEntries(selectedFields.map((field) => [field, true]));
    if (fields.id) select.id = true;
  }

  return { page, limit, skip: (page - 1) * limit, where, orderBy, select };
};

const collectionLinks = (req, page, pages) => {
  const build = (targetPage) => {
    const url = new URL(req.originalUrl, 'http://localhost');
    url.searchParams.set('page', String(targetPage));
    return `${url.pathname}${url.search}`;
  };
  const lastPage = Math.max(pages, 1);
  return {
    self: build(page),
    first: build(1),
    prev: page > 1 ? build(page - 1) : null,
    next: page < lastPage ? build(page + 1) : null,
    last: build(lastPage)
  };
};

const addResourceLinks = (resource, records) => records.map((record) => ({
  ...record,
  _links: {
    self: { href: `/api/v1/${resource}/${record.id}` },
    update: { href: `/api/v1/${resource}/${record.id}`, method: 'PUT' },
    delete: { href: `/api/v1/${resource}/${record.id}`, method: 'DELETE' }
  }
}));

module.exports = { parseListQuery, collectionLinks, addResourceLinks };

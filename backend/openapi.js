const queryParameters = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
  { name: 'search', in: 'query', schema: { type: 'string' } },
  { name: 'sort', in: 'query', description: 'Comma-separated fields; prefix a field with - for descending order.', schema: { type: 'string' } },
  { name: 'fields', in: 'query', description: 'Comma-separated allowlisted scalar fields to return.', schema: { type: 'string' } },
  {
    name: 'filter', in: 'query', style: 'deepObject', explode: true,
    description: 'Filter allowlisted fields, for example filter[name]=Ada.',
    schema: { type: 'object', additionalProperties: { type: 'string' } }
  }
];
const listResponse = {
  description: 'Paginated resource collection with HATEOAS links.',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { type: 'object', properties: { _links: { type: 'object' } } } },
          pagination: { type: 'object', properties: { total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, pages: { type: 'integer' } } },
          links: { type: 'object' }
        }
      }
    }
  }
};
const listOperation = (tag) => ({
  tags: [tag], security: [{ bearerAuth: [] }], parameters: queryParameters, responses: { 200: listResponse, 400: { description: 'Invalid query parameter' } }
});
const protectedOperation = (tag, summary) => ({
  tags: [tag], summary, security: [{ bearerAuth: [] }],
  responses: { 200: { description: 'Successful response' }, 401: { description: 'Authentication required' }, 403: { description: 'Insufficient role' } }
});

module.exports = {
  openapi: '3.0.3',
  info: { title: 'MediTrack API', version: '1.0.0', description: 'Versioned healthcare operations API.' },
  servers: [{ url: '/api/v1' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }
  },
  paths: {
    '/health': { get: { tags: ['System'], security: [], responses: { 200: { description: 'Service is healthy' } } } },
    '/auth/register': { post: { tags: ['Authentication'], security: [], responses: { 201: { description: 'Account created' }, 400: { description: 'Invalid registration data' } } } },
    '/auth/login': { post: { tags: ['Authentication'], security: [], responses: { 200: { description: 'JWT and user profile' }, 401: { description: 'Invalid credentials' } } } },
    '/patients': {
      get: listOperation('Patients'),
      post: { ...protectedOperation('Patients', 'Create patient'), responses: { 201: { description: 'Patient created' }, 400: { description: 'Invalid patient data' } } }
    },
    '/patients/{id}': {
      get: { ...protectedOperation('Patients', 'Get patient'), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }] },
      put: { ...protectedOperation('Patients', 'Update patient'), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }] },
      delete: { ...protectedOperation('Patients', 'Delete patient'), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }] }
    },
    '/doctors': { get: listOperation('Doctors'), post: protectedOperation('Doctors', 'Create doctor') },
    '/appointments': { get: listOperation('Appointments'), post: protectedOperation('Appointments', 'Create appointment') },
    '/appointments/stats': { get: protectedOperation('Appointments', 'Appointment counts by doctor and status') },
    '/reports/dashboard': { get: protectedOperation('Reports', 'Dashboard totals, status counts, and upcoming appointments') },
    '/bulk/{resource}/export': {
      get: { ...protectedOperation('Bulk transfer', 'Export up to 5000 patients or doctors'), parameters: [{ name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: ['patients', 'doctors'] } }] }
    },
    '/bulk/{resource}/import': {
      post: { ...protectedOperation('Bulk transfer', 'Validate and import up to 500 records'), parameters: [{ name: 'resource', in: 'path', required: true, schema: { type: 'string', enum: ['patients', 'doctors'] } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['records'], properties: { records: { type: 'array', maxItems: 500, items: { type: 'object' } } } } } } }, responses: { 201: { description: 'Records imported' }, 400: { description: 'Invalid input; no records imported' } } }
    },
    '/notifications': {
      get: { ...listOperation('Notifications'), parameters: [...queryParameters, { name: 'unread', in: 'query', schema: { type: 'boolean' } }] },
      post: { ...protectedOperation('Notifications', 'Create a notification for a user'), requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['userId', 'message'], properties: { userId: { type: 'integer' }, type: { type: 'string', enum: ['info', 'success', 'warning', 'alert'] }, message: { type: 'string', maxLength: 1000 } } } } } } }
    },
    '/notifications/{id}/read': {
      patch: { ...protectedOperation('Notifications', 'Mark your notification as read'), parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }] }
    }
  }
};

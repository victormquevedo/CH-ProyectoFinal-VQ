export const errorsDict = {
  INVALID_TYPE_ERROR: { code: 400, msg: 'Invalid data type' },
  UNAUTHORIZED: { code: 401, msg: 'Unauthorized for the requested endpoint' },
  ROUTING_ERROR: { code: 404, msg: 'Requested endpoint not found' },
  INVALID_CREDENTIALS: { code: 498, msg: 'Invalid credentials' },
  DATABASE_ERROR: { code: 500, msg: 'Database error' },
  INTERNAL_ERROR: { code: 500, msg: 'Internal server execution error' }
};

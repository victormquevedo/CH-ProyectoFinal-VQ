import swaggerJsdoc from 'swagger-jsdoc';

// Initial config for swaggerJsdoc
const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: `VQ Store`,
      description: `API's documentation for products and carts`
    }
  },
  apis: ['./src/docs/**/*.yaml']
};

export const swaggerSpecs = swaggerJsdoc(swaggerOptions);

import { Faker, en } from '@faker-js/faker';

const faker = new Faker({ locale: [en] });

export const generateProducts = (productsQty) => {
  let products = [];

  for (let i = 0; i < productsQty; i++) {
    products.push(generateProduct(i + 1));
  }

  return products;
};

export const generateProduct = (id) => {
  return {
    _id: faker.database.mongodbObjectId(),
    id,
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    code: `${faker.commerce.department().slice(0, 2).toUpperCase()}-${faker.number.int(999).toString().padStart(3, '0')}`,
    price: faker.commerce.price(),
    status: true,
    stock: faker.number.int(200),
    category: faker.commerce.department(),
    image: Array.from({ length: faker.number.int(5) }, () => faker.image.urlLoremFlickr())
  };
};

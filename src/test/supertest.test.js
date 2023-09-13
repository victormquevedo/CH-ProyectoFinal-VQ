import chai from 'chai';
import supertest from 'supertest';
import config from '../utils/config.js';
import MongoSingleton from '../dao/mongo.js';
import mongoose from 'mongoose';
import usersModel from '../models/users.model.js';
import cartsModel from '../models/carts.model.js';
import ticketsModel from '../models/tickets.model.js';

const expect = chai.expect;
const requester = supertest(`http://127.0.0.1:${parseInt(config.PORT)}`);

describe(`VQ Store Integration Test`, function () {
  this.timeout(60000);

  before(async function () {
    try {
      await MongoSingleton.getInstance();
    } catch (err) {
      console.error(err);
    }
  });

  const adminToTest = {
    login_email: 'admin_test_victor.quevedo.1801@gmail.com',
    login_password: 'test123456789'
  };
  let adminSessionCookie;

  const userToTest = {
    login_email: 'user_test_victor.quevedo.1801@gmail.com',
    login_password: 'test123456789'
  };
  let userSessionCookie;

  const premiumToTest = {
    login_email: 'premium_test_victor.quevedo.1801@gmail.com',
    login_password: 'test123456789'
  };
  let premiumSessionCookie;

  let cartId;

  describe('Test main API', () => {
    it('POST /register creates a new user correctly', async function () {
      const newUser = {
        first_name: 'Test victor',
        last_name: 'Test quevedo',
        age: 100,
        role: 'admin',
        ...adminToTest
      };
      const { statusCode, headers } = await requester.post('/register').send(newUser);

      // Cuando el usuario se registra satisfactoriamente, es redirigido al main url
      // Caso contrario, se quedaría en /register
      // El usario queda logueado y por lo tanto se debe desloguear en el próximo test
      const redirectLocation = new URL(headers.location);
      expect(statusCode).to.be.eql(302);
      expect(redirectLocation.pathname).to.be.eql('/');
    });

    it('GET /logout destroys the session', async function () {
      const { statusCode, headers } = await requester.get('/logout');

      // Cuando se desloguea, es redirigido al main url
      const redirectLocation = new URL(headers.location);
      expect(statusCode).to.be.eql(302);
      expect(redirectLocation.pathname).to.be.eql('/');
    });

    it('POST /login to login with the already registered user', async function () {
      const { statusCode, headers } = await requester.post('/login').send(adminToTest);
      adminSessionCookie = headers['set-cookie'][0].match(/connect\.sid=[^;]+/)[0];

      // Logueamos al usario, y debe ser redirigido al main
      // En caso de que sea exitoso, se setea una cookie en los headers (esto también se podría haber verificado en register)
      const redirectLocation = new URL(headers.location);
      expect(statusCode).to.be.eql(302);
      expect(redirectLocation.pathname).to.be.eql('/');
      expect(adminSessionCookie).to.be.a.string;

      // Finalmente cierro la sesión del administrador
      await requester.get('/logout');
    });
  });

  describe('Test products API', () => {
    it('GET /api/products to get all products', async function () {
      // Logueo al administrador
      const { headers } = await requester.post('/login').send(adminToTest);
      headers['set-cookie'][0].match(/connect\.sid=[^;]+/)[0];

      const { statusCode, ok, body } = await requester.get('/api/products').set('Cookie', [adminSessionCookie]);

      expect(statusCode).to.be.eql(200);
      expect(ok).to.be.true;
      expect(body.payload).to.be.an('array');
      expect(body.payload[0]._id).to.be.a.string;

      // Cierro la sesión del administrador
      await requester.get('/logout');
    });

    it('POST /api/products/ to add a new product', async function () {
      // Logueo al administrador
      const { headers } = await requester.post('/login').send(adminToTest);
      headers['set-cookie'][0].match(/connect\.sid=[^;]+/)[0];

      const newProduct = {
        id: 1000,
        title: 'Test Product',
        description: 'Test description',
        code: 'TEST-000',
        price: 1000,
        status: true,
        stock: 1000,
        category: 'Test',
        thumbnails: [],
        owner: adminToTest.login_email
      };
      const { statusCode, ok } = await requester.post('/api/products').send(newProduct).set('Cookie', [adminSessionCookie]);

      expect(statusCode).to.be.eql(200);
      expect(ok).to.be.true;

      const { body: newBody } = await requester.get(`/api/products/${newProduct.id}`).set('Cookie', [adminSessionCookie]);

      expect(newBody.id === newProduct.id);

      // Borro el producto agregado
      await requester.delete(`/api/products/${newProduct.id}`).set('Cookie', [adminSessionCookie]);

      // Cierro la sesión del administrador
      await requester.get('/logout');
    });

    it('PUT /api/products/:pid to update a product', async function () {
      // Logueo al administrador
      const { headers } = await requester.post('/login').send(adminToTest);
      headers['set-cookie'][0].match(/connect\.sid=[^;]+/)[0];

      const newProduct = {
        id: 2000,
        title: 'Test Product',
        description: 'Test description',
        code: 'TEST-001',
        price: 1000,
        status: true,
        stock: 1000,
        category: 'Test',
        thumbnails: [],
        owner: adminToTest.login_email
      };
      await requester.post('/api/products').send(newProduct).set('Cookie', [adminSessionCookie]);
      const { statusCode, ok } = await requester
        .put(`/api/products/${newProduct.id}`)
        .send({ ...newProduct, title: 'Updated Test Product' })
        .set('Cookie', [adminSessionCookie]);

      expect(statusCode).to.be.eql(200);
      expect(ok).to.be.true;

      const { body } = await requester.get(`/api/products/${newProduct.id}`).set('Cookie', [adminSessionCookie]);

      expect(body.title).to.be.eql('Updated Test Product');

      // Borro el producto agregado
      await requester.delete(`/api/products/${newProduct.id}`).set('Cookie', [adminSessionCookie]);

      // Cierro la sesión del administrador
      await requester.get('/logout');
    });

    it('DELETE /API/PRODUCTS/:pid to remove a product where the owner is a premium user', async () => {
      // Registro al usuario premium
      await requester.post('/register').send({ ...premiumToTest, role: 'premium' });

      // Logueo al admin
      const { headers } = await requester.post('/login').send(adminToTest);
      headers['set-cookie'][0].match(/connect\.sid=[^;]+/)[0];

      // Agrego un producto
      const newProduct = {
        id: 3000,
        title: 'Test Product',
        description: 'Test description',
        code: 'TEST-999',
        price: 1000,
        status: true,
        stock: 1000,
        category: 'Test',
        thumbnails: [],
        owner: premiumToTest.login_email
      };
      await requester.post('/api/products').send(newProduct).set('Cookie', [adminSessionCookie]);

      // Verifico que el producto exista
      const { body } = await requester.get(`/api/products/${newProduct.id}`).set('Cookie', [adminSessionCookie]);
      expect(body.id).to.be.eql(newProduct.id);

      // Elimino el producto
      const { statusCode, ok } = await requester.delete(`/api/products/${newProduct.id}`).set('Cookie', [adminSessionCookie]);
      expect(statusCode).to.be.eql(200);
      expect(ok).to.be.true;
    });
  });

  describe('Test carts API', () => {
    it('POST /api/carts/ to create a cart and assign it to a user', async function () {
      // Primero creo un usuario sin rol, para que sea convertido automáticamente en user
      await requester.post('/register').send(userToTest);
      const { headers } = await requester.post('/login').send(userToTest);
      userSessionCookie = headers['set-cookie'][0].match(/connect\.sid=[^;]+/)[0];

      // Luego le agrego un carrito al usuario
      const { statusCode, ok, body } = await requester.post('/api/carts').send({ email: userToTest.login_email }).set('Cookie', [userSessionCookie]);

      cartId = body.id;
      expect(statusCode).to.be.eql(200);
      expect(ok).to.be.true;
      expect(cartId).to.be.a('number');
      expect(cartId % 1).to.equal(0);

      // Cierro la sesión del user
      await requester.get('/logout');
    });

    const newProduct = {
      id: 4000,
      title: 'Test Product',
      description: 'Test description',
      code: 'TEST-002',
      price: 1000,
      status: true,
      stock: 1000,
      category: 'Test',
      thumbnails: [],
      owner: adminToTest.login_email
    };

    it('POST api/carts/:cid/products/:pid to add a product to a cart', async function () {
      // Logueo al administrador
      await requester.post('/login').send(adminToTest);

      // Primero agrego un producto nuevo a la colección con el usuario administrador
      await requester.post('/api/products').send(newProduct).set('Cookie', [adminSessionCookie]);

      // Cierro la sesión del administrador
      await requester.get('/logout');

      // Logueo al user
      await requester.post('/login').send(userToTest);

      // Luego agrego el producto creado por el administrador al carrito con el user
      const { statusCode, ok } = await requester.post(`/api/carts/${cartId}/products/${newProduct.id}`).set('Cookie', [userSessionCookie]);

      expect(statusCode).to.be.eql(200);
      expect(ok).to.be.true;

      // Verifico si el producto se agregó efectivamente al carrito
      const { body } = await requester.get(`/api/carts/${cartId}`).set('Cookie', [userSessionCookie]);

      expect(body.productsInCart[0].id).to.be.eql(newProduct.id);

      // Vuelvo a loguear al administrador y borro el producto creado
      await requester.post('/login').send(adminToTest);
      await requester.delete(`/api/products/${newProduct.id}`).set('Cookie', [adminSessionCookie]);

      // Cierro la sesión del user
      await requester.get('/logout');
    });

    it('DELETE /:cid/products/:pid to remove a product from a cart', async () => {
      // Logueo al user
      await requester.post('/login').send(userToTest);

      // Luego elimino el producto del carrito
      const { statusCode, ok } = await requester.delete(`/api/carts/${cartId}/products/${newProduct.id}`).set('Cookie', [userSessionCookie]);

      expect(statusCode).to.be.eql(200);
      expect(ok).to.be.true;

      // Verifico que el carrito esté vacío
      const { body } = await requester.get(`/api/carts/${cartId}`).set('Cookie', [userSessionCookie]);

      expect(body.productsInCart).to.be.empty;

      // Cierro la sesión del user
      await requester.get('/logout');
    });

    it('DELETE /:cid to remove all products from a cart', async () => {
      const newProduct_1 = {
        id: 5000,
        title: 'Test Product',
        description: 'Test description',
        code: 'TEST-100',
        price: 1000,
        status: true,
        stock: 1000,
        category: 'Test',
        thumbnails: [],
        owner: adminToTest.login_email
      };
      const newProduct_2 = {
        id: 6000,
        title: 'Test Product',
        description: 'Test description',
        code: 'TEST-200',
        price: 1000,
        status: true,
        stock: 1000,
        category: 'Test',
        thumbnails: [],
        owner: adminToTest.login_email
      };
      const newProduct_3 = {
        id: 7000,
        title: 'Test Product',
        description: 'Test description',
        code: 'TEST-300',
        price: 1000,
        status: true,
        stock: 1000,
        category: 'Test',
        thumbnails: [],
        owner: adminToTest.login_email
      };

      // Logueo al administrador
      await requester.post('/login').send(adminToTest);

      // Agrego los 3 productos a la colección
      await requester.post('/api/products').send(newProduct_1).set('Cookie', [adminSessionCookie]);
      await requester.post('/api/products').send(newProduct_2).set('Cookie', [adminSessionCookie]);
      await requester.post('/api/products').send(newProduct_3).set('Cookie', [adminSessionCookie]);

      // Cierro la sesión del administrador
      await requester.get('/logout');

      // Logueo al user
      await requester.post('/login').send(userToTest);

      // Agrego los 3 productos al carrito
      await requester.post(`/api/carts/${cartId}/products/${newProduct_1.id}`).set('Cookie', [userSessionCookie]);
      await requester.post(`/api/carts/${cartId}/products/${newProduct_2.id}`).set('Cookie', [userSessionCookie]);
      await requester.post(`/api/carts/${cartId}/products/${newProduct_3.id}`).set('Cookie', [userSessionCookie]);

      // Verifico que el carrito tenga 3 productos
      const { body } = await requester.get(`/api/carts/${cartId}`).set('Cookie', [userSessionCookie]);

      expect(body.productsInCart.length).to.be.eql(3);

      // Borro todos los productos del carrito
      const { statusCode, ok } = await requester.delete(`/api/carts/${cartId}`).set('Cookie', [userSessionCookie]);

      expect(statusCode).to.be.eql(200);
      expect(ok).to.true;

      // Verifico que el carrito esté vacío
      const { body: newBody } = await requester.get(`/api/carts/${cartId}`).set('Cookie', [userSessionCookie]);

      expect(newBody.productsInCart).to.be.empty;

      // Cierro la sesión del user
      await requester.get('/logout');

      // Vuelvo a loguear al administrador y borro los productos creado
      await requester.post('/login').send(adminToTest);
      await requester.delete(`/api/products/${newProduct_1.id}`).set('Cookie', [adminSessionCookie]);
      await requester.delete(`/api/products/${newProduct_2.id}`).set('Cookie', [adminSessionCookie]);
      await requester.delete(`/api/products/${newProduct_3.id}`).set('Cookie', [adminSessionCookie]);

      // Cierro la sesión del administrador
      await requester.get('/logout');
    });

    it('POST /:cid/purchase to create a ticket', async () => {
      const newProduct_1 = {
        id: 8000,
        title: 'Test Product',
        description: 'Test description',
        code: 'TEST-100',
        price: 1000,
        status: true,
        stock: 1000,
        category: 'Test',
        thumbnails: [],
        owner: adminToTest.login_email
      };
      const newProduct_2 = {
        id: 9000,
        title: 'Test Product',
        description: 'Test description',
        code: 'TEST-200',
        price: 2000,
        status: true,
        stock: 1000,
        category: 'Test',
        thumbnails: [],
        owner: adminToTest.login_email
      };
      const newProduct_3 = {
        id: 10000,
        title: 'Test Product',
        description: 'Test description',
        code: 'TEST-300',
        price: 3000,
        status: true,
        stock: 1000,
        category: 'Test',
        thumbnails: [],
        owner: adminToTest.login_email
      };
      const newProduct_sin_stock = {
        id: 11000,
        title: 'Test Product',
        description: 'Test description',
        code: 'TEST-400',
        price: 3000,
        status: true,
        stock: 0,
        category: 'Test',
        thumbnails: [],
        owner: adminToTest.login_email
      };

      // Logueo al administrador
      await requester.post('/login').send(adminToTest);

      // Agrego los 4 productos a la colección
      await requester.post('/api/products').send(newProduct_1).set('Cookie', [adminSessionCookie]);
      await requester.post('/api/products').send(newProduct_2).set('Cookie', [adminSessionCookie]);
      await requester.post('/api/products').send(newProduct_3).set('Cookie', [adminSessionCookie]);
      await requester.post('/api/products').send(newProduct_sin_stock).set('Cookie', [adminSessionCookie]);

      // Cierro la sesión del administrador
      await requester.get('/logout');

      // Logueo al user
      await requester.post('/login').send(userToTest);

      // Agrego los 4 productos al carrito
      await requester.post(`/api/carts/${cartId}/products/${newProduct_1.id}`).set('Cookie', [userSessionCookie]);
      await requester.post(`/api/carts/${cartId}/products/${newProduct_2.id}`).set('Cookie', [userSessionCookie]);
      await requester.post(`/api/carts/${cartId}/products/${newProduct_3.id}`).set('Cookie', [userSessionCookie]);
      await requester.post(`/api/carts/${cartId}/products/${newProduct_sin_stock.id}`).set('Cookie', [userSessionCookie]);

      // Verifico que el carrito tenga 4 productos
      const { body } = await requester.get(`/api/carts/${cartId}`).set('Cookie', [userSessionCookie]);

      expect(body.productsInCart.length).to.be.eql(4);

      // Finalizo la compra
      const { statusCode, ok, body: purchaseBody } = await requester.post(`/api/carts/${cartId}/purchase`).set('Cookie', [userSessionCookie]);

      expect(statusCode).to.be.eql(200);
      expect(ok).to.be.true;

      // Verifico que el ticket contenga el precio correcto (no debe incluir el producto sin stock)
      const document = await ticketsModel.findOne({ purchaser: userToTest.login_email });
      expect(document.amount).to.be.eql(newProduct_1.price + newProduct_2.price + newProduct_3.price);

      // Cierro la sesión del user
      await requester.get('/logout');

      // Vuelvo a loguear al administrador y borro los productos creados
      await requester.post('/login').send(adminToTest);
      await requester.delete(`/api/products/${newProduct_1.id}`).set('Cookie', [adminSessionCookie]);
      await requester.delete(`/api/products/${newProduct_2.id}`).set('Cookie', [adminSessionCookie]);
      await requester.delete(`/api/products/${newProduct_3.id}`).set('Cookie', [adminSessionCookie]);
      await requester.delete(`/api/products/${newProduct_sin_stock.id}`).set('Cookie', [adminSessionCookie]);

      // Cierro la sesión del administrador
      await requester.get('/logout');
    });
  });

  describe('Test users API', () => {
    it('POST /:uid/documents to upload pdf files to disk', async () => {
      // Obtengo el id del user
      const { _id } = await usersModel.findOne({ email: userToTest.login_email });

      // Cargo el documento con el nombre del mismo
      const fileName = 'file-sample_150kB.pdf';
      const documentName_1 = 'Identification';
      const { statusCode, ok, body } = await requester.post(`/api/users/${_id}/documents`).field('name', documentName_1).attach('documents', `./data/${fileName}`);
      expect(statusCode).to.be.eql(200);
      expect(ok).to.be.true;
      expect(body.filesUpdatedSuccessfully[0]).to.be.eql(fileName);

      // Verifico que el documento esté en la base de datos con el nombre del documento
      const { documents } = await usersModel.findOne({ email: userToTest.login_email });
      expect(documents[0].name).to.be.eql(documentName_1);
    });

    it('POST /premium/:uid to convert the user to premium', async () => {
      // Obtengo el id del user y su rol original
      const { _id, role: initialRole } = await usersModel.findOne({ email: userToTest.login_email });
      expect(initialRole).to.be.eql('user');

      // Intento convertir el user a premium, el cual debe fallar porque todavía no cargó todos los documentos
      const { statusCode, ok } = await requester.post(`/api/users/premium/${_id}`);
      expect(statusCode).to.be.eql(500);
      expect(ok).to.be.false;

      // Obtengo el role del usuario y verifico que no sea premium todavía
      const { role } = await usersModel.findOne({ email: userToTest.login_email });
      expect(role).to.not.be.eql('premium');

      // Cargo los documentos faltantes
      const fileName = 'file-sample_150kB.pdf';
      const documentName_2 = 'Proof of address';
      const documentName_3 = 'Statement of account';

      await requester.post(`/api/users/${_id}/documents`).field('name', documentName_2).attach('documents', `./data/${fileName}`);
      await requester.post(`/api/users/${_id}/documents`).field('name', documentName_3).attach('documents', `./data/${fileName}`);

      // Convierto el user a premium
      const { statusCode: finalStatusCode, ok: finalOk } = await requester.post(`/api/users/premium/${_id}`);
      expect(finalStatusCode).to.be.eql(200);
      expect(finalOk).to.be.true;

      // Obtengo nuveamente el role del usuario y verifico que ahora sí sea premium
      const { role: finalRole } = await usersModel.findOne({ email: userToTest.login_email });
      expect(finalRole).to.be.eql('premium');
    });

    it('GET /api/users must get all the users', async () => {
      const { statusCode, ok, body } = await requester.get('/api/users');
      expect(statusCode).to.be.eql(200);
      expect(ok).to.be.true;
      body.forEach((user) => {
        expect(user.email).to.be.a.string;
        expect(user.role).to.be.a.string;
      });
    });

    it('DELETE /api/users/:minutes? must remove all of the users where the last connection is greater than the sent minutes', async () => {
      // Primero creo un usuario
      const userToTestLastConnectionDelete = {
        login_email: 'user_test_last_connection_delete@gmail.com',
        login_password: 'test123456789'
      };
      await requester.post('/register').send(userToTestLastConnectionDelete);

      // Luego hago un login para que se agregue la última conexión del usuario
      await requester.post('/login').send(userToTestLastConnectionDelete);

      // Pruebo el endpoint sin enviar un tiempo para que tome el default que es 30 minutos
      const { statusCode: notRemovedStatusCode, ok: notRemovedOk } = await requester.delete('/api/users');
      expect(notRemovedStatusCode).to.be.eql(200);
      expect(notRemovedOk).to.be.true;

      // Verifico que el usuario siga existiendo
      const notRemovedUser = await usersModel.findOne({ email: userToTestLastConnectionDelete.login_email });
      expect(notRemovedUser).to.exist;

      // Tomo la última conexión del usuario. Con esto puedo verificar que el usuario existe
      const { last_connection } = await usersModel.findOne({ email: userToTestLastConnectionDelete.login_email });

      // Pruebo el endpoint enviando un tiempo en minutos menor a la última conexión para que se elimine
      // No hace falta restarle por el delay del endpoint
      const { statusCode: removedStatusCode, ok: removedOk } = await requester.delete(`/api/users/${(new Date() - last_connection) / 60000}`);
      expect(removedStatusCode).to.be.eql(200);
      expect(removedOk).to.be.true;

      // Verifico que el usuario no exista más
      const removedUser = await usersModel.findOne({ email: userToTestLastConnectionDelete.login_email });
      expect(removedUser).to.be.null;
    });
  });

  after(async function () {
    try {
      // Destruyo la sesión y borro lo creado por los tests
      await usersModel.findOneAndDelete({ email: adminToTest.login_email });
      await usersModel.findOneAndDelete({ email: userToTest.login_email });
      await usersModel.findOneAndDelete({ email: premiumToTest.login_email });
      await cartsModel.findOneAndDelete({ id: cartId });
      await ticketsModel.findOneAndDelete({ purchaser: userToTest.login_email });
      await mongoose.connection.db.dropCollection('sessions');
      await mongoose.disconnect();
    } catch (err) {
      console.error(err.message);
    }
  });
});

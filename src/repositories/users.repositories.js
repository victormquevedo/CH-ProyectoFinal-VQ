import UsersDTO from '../dao/DTOs/users.dto.js';

class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  addUser = async ({ firstName, lastName, age, email, password, role }) => {
    return await this.dao.addUser({ firstName, lastName, age, email, password, role });
  };

  addCartId = async (email, cartId) => {
    return await this.dao.addCartId(email, cartId);
  };

  getUserByEmail = async (email) => {
    const user = await this.dao.getUserByEmail(email);
    return new UsersDTO(user);
  };

  getUserById = async (id) => {
    return await this.dao.getUserById(id); // Solo para uso interno, no pasa por el DTO
  };

  getUserByCart = async (cartId) => {
    const user = await this.dao.getUserByCart(cartId);
    return new UsersDTO(user);
  };

  restorePassword = async ({ email, password }) => {
    return await this.dao.restorePassword({ email, password });
  };

  convertUser = async (uid) => {
    return await this.dao.convertUser(uid);
  };

  uploadDocuments = async ({ uid, name, reference }) => {
    return await this.dao.uploadDocuments({ uid, name, reference });
  };

  addLastConnectionTimeDateToUser = async (uid) => {
    return await this.dao.addLastConnectionTimeDateToUser(uid);
  };

  getUsers = async () => {
    const users = await this.dao.getUsers();
    let cleanUsers = [];
    users.forEach((user) => {
      cleanUsers.push(new UsersDTO(user));
    });
    return cleanUsers;
  };

  removeInactiveUsers = async (inactiveMinutes) => {
    return await this.dao.removeInactiveUsers(inactiveMinutes);
  };

  removeUser = async (uid) => {
    return await this.dao.removeUser(uid);
  };
}

export default UsersRepository;

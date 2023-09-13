import usersModel from '../../models/users.model.js';
import CustomError from '../../services/customErrors.js';
import { errorsDict } from '../../utils/errorsDict.js';
import { createHash } from '../../utils/validation.js';

class UsersManager {
  constructor() {
    this.users = [];
  }

  addUser = async ({ firstName, lastName, age, email, password, role = 'user' }) => {
    try {
      if ([email, password].includes(undefined)) {
        throw new Error(`Not Valid - insufficient data`);
      }
      await usersModel.create({
        first_name: firstName,
        last_name: lastName,
        age,
        email,
        password: createHash(password),
        role
      });
      return { message: `User registered satisfactory` };
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `addUser - ${err}`, true);
    }
  };

  addCartId = async (email, cartId) => {
    try {
      await usersModel.updateOne({ email }, { $set: { cart: cartId } });
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `addCartId - ${err}`, true);
    }
  };

  getUserByEmail = async (email) => {
    try {
      return await usersModel.findOne({ email }).lean();
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `getUserByEmail - ${err}`, true);
    }
  };

  getUserById = async (id) => {
    try {
      const user = await usersModel.findById(id).lean();
      if (!user) throw new Error('User not found');
      return user;
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `getUserById - ${err}`, true);
    }
  };

  getUserByCart = async (cartId) => {
    try {
      const user = await usersModel.findOne({ cart: cartId });
      if (!user) throw new Error('Cart is empty'); // El id del carrito se genera desde el front cuando el usuario ingresa el primer producto
      return user;
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `getUserByCart - ${err}`, true);
    }
  };

  restorePassword = async ({ email, password }) => {
    try {
      if (!(await usersModel.findOne({ email }))) {
        throw new Error(`The email ${email} doesn't exist`);
      }
      await usersModel.updateOne({ email }, { $set: { password: createHash(password) } });
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `restorePassword - ${err}`, true);
    }
  };

  convertUser = async (uid) => {
    try {
      const userToConvert = await usersModel.findById(uid);
      if (!userToConvert) {
        throw new Error('User not found');
      }
      const currentRole = userToConvert.role;
      if (!(currentRole === 'user' || currentRole === 'premium')) {
        throw new Error(`User can't be converted since it is not a user or premium role`);
      }
      const { documents } = userToConvert;
      if (
        documents.some((document) => document.name === 'Identification') &&
        documents.some((document) => document.name === 'Proof of address') &&
        documents.some((document) => document.name === 'Statement of account')
      ) {
        await usersModel.findByIdAndUpdate(uid, {
          role: currentRole === 'premium' ? 'user' : 'premium'
        });
        return {
          message: `User updated successfully to ${currentRole === 'premium' ? 'user' : 'premium'}`
        };
      }
      throw new Error('Missing documents to upload');
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `convertUser - ${err}`);
    }
  };

  uploadDocuments = async ({ uid, name, reference }) => {
    try {
      const userToAddDocuments = await usersModel.findById(uid);
      if (!userToAddDocuments) {
        throw new Error('User not found');
      }
      const documents = [...(userToAddDocuments.documents ?? []), { name, reference }];
      await usersModel.findByIdAndUpdate(uid, {
        documents
      });
      return true;
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `uploadDocuments - ${err}`);
    }
  };

  addLastConnectionTimeDateToUser = async (uid) => {
    try {
      const userToAddLastConnection = await usersModel.findById(uid);
      if (!userToAddLastConnection) {
        throw new Error('User not found');
      }
      await usersModel.findByIdAndUpdate(uid, {
        last_connection: new Date()
      });
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `addLastConnectionTimeDateToUser - ${err}`);
    }
  };

  getUsers = async () => {
    try {
      return await usersModel.find().limit(100).lean();
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `getUsers - ${err}`);
    }
  };

  removeInactiveUsers = async (inactiveMinutes = 30) => {
    try {
      const result = await usersModel.deleteMany({ last_connection: { $lt: new Date(Date.now() - inactiveMinutes * 60 * 1000) } });
      return { message: `Successfully deleted ${result.deletedCount} users whith a last connection greater than ${inactiveMinutes} minutes` };
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `removeInactiveUsers - ${err}`);
    }
  };

  removeUser = async (uid) => {
    try {
      const user = await usersModel.findById(uid);
      if (!user) throw new Error('User not found');
      await usersModel.findByIdAndDelete(uid);
      return { message: `User ${user.email} deleted successfully` };
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `removeUser - ${err}`);
    }
  };
}

export default UsersManager;

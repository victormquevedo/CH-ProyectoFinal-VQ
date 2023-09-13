import productsModel from '../../models/products.model.js';
import CustomError from '../../services/customErrors.js';
import { errorsDict } from '../../utils/errorsDict.js';

class ProductManager {
  constructor() {
    this.products = [];
  }

  getProducts = async ({ limit = 10, page = 1, sort, category, stockGreaterThan }) => {
    try {
      const customLabels = {
        docs: 'payload',
        totalDocs: false,
        limit: false,
        pagingCounter: false
      };
      const query = {};
      category && (query.category = category);
      stockGreaterThan && (query.stock = { $gt: stockGreaterThan });
      const sortByPrice = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : undefined;
      const paginatedProducts = await productsModel.paginate(query, {
        limit,
        page,
        sort: sortByPrice,
        customLabels,
        lean: true,
        leanWithId: false
      });
      const extraLabels = {
        prevLink: paginatedProducts.hasPrevPage ? `/api/products?page=${parseInt(page) - 1}` : null,
        nextLink: paginatedProducts.hasNextPage ? `/api/products?page=${parseInt(page) + 1}` : null
      };
      extraLabels.status = 'success';
      return { ...paginatedProducts, ...extraLabels };
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `getProducts - ${err}`, true);
    }
  };

  getProductById = async (id) => {
    try {
      const product = await productsModel.findOne({ id }).lean();
      if (!product) {
        throw new Error(`Product doesn't exist in the database`);
      }
      return product;
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `getProductById - ${err}`, true);
    }
  };

  addProduct = async (data) => {
    try {
      const { title, description, code, price, stock, category, owner } = data;
      if ([title, description, code, price, stock, category].includes(undefined)) {
        throw new Error(`Not Valid - Enter all the mandatory fields`);
      }
      if ((await productsModel.findOne({ code })) !== null) {
        throw new Error(`${title} - ${code} Not valid - Repeated code`);
      }
      const products = await productsModel.find().sort({ _id: -1 }).limit(1);
      const id = products.length > 0 ? products[0].id + 1 : 1; // id autoincrementable
      await productsModel.create({ id, status: true, ...data, owner: owner });
      return { id, message: `Product ${title} - ${code} added successfully` };
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `addProduct - ${err}`, true);
    }
  };

  updateProduct = async (data) => {
    try {
      const { id } = data;
      const productToUpdate = await productsModel.findOne({ id });
      if (!productToUpdate) {
        throw new Error(`The ID ${id} you want to update doesn't exist in the database`);
      }
      const dataToUpdate = Object.fromEntries(Object.entries(data).filter(([key, value]) => value !== undefined));
      await productsModel.updateOne({ id }, { $set: dataToUpdate });
      return { message: `Product updated successfully` };
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `updateProduct - ${err}`, true);
    }
  };

  deleteProduct = async (id) => {
    try {
      if (!(await productsModel.findOne({ id }))) {
        throw new Error(`The ID ${id} you want to delete doesn't exist in the database`);
      }
      await productsModel.findOneAndDelete({ id });
      return { message: `Product deleted successfully` };
    } catch (err) {
      throw new CustomError(errorsDict.DATABASE_ERROR, `deleteProduct - ${err}`, true);
    }
  };
}

export default ProductManager;

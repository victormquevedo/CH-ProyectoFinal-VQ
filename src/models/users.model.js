import mongoose from 'mongoose';

const collection = 'users';

const schema = new mongoose.Schema({
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  age: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    type: Number
  },
  role: {
    type: String,
    enum: ['premium', 'admin', 'user'],
    required: true
  },
  documents: [
    {
      name: {
        type: String
      },
      reference: {
        type: String
      }
    }
  ],
  last_connection: {
    type: Date
  }
});

const usersModel = mongoose.model(collection, schema);

export default usersModel;

const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: [true, 'Id is required']
  },
  name: String,
  categoryId: {
    type: Number,
    required: [true, 'CategoryId is required']
  },
  abbreviation: String,
  requirements: [{ _id: String, value: Number }],
  created: {
    type: Date,
    required: [true, 'Created date is required']
  }
});

module.exports = productSchema

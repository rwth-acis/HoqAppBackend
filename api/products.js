const express = require('express');
const mongoose = require('mongoose');
mongoose.connect('mongodb://test:badmin@mongodb.docker-registry:27017/test?authSource=admin&retryWrites=true&w=majority', {useNewUrlParser: true});

const productSchema = require('../Schemas/product-schema.js');
const Product = mongoose.model('product', productSchema);
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const router = express.Router();

// read products
router.get('/', (req, res) => {
  if(req.query.categoryId){
    Product.find({categoryId: req.query.categoryId}, function(err, products){
      if(products.length == 0){
        for(var i = 0; i < 5; i++){
          var product = new Product({
            id: i,
            name: "",
            categoryId: req.query.categoryId,
            abbreviation: "",
            requirements: [],
            created: Date.now()
          });
          requirements = getRequest('https://requirements-bazaar.org/bazaar/categories/' + req.query.categoryId + '/requirements?per_page=500&state=all');
          for(j = 0; j < requirements.length; j++){
            product.requirements.push({_id: requirements[j].id, value: 0});
          }
          product.save(function(err2){
            if (err2) return console.error(err2);
          });
          products.push(product);
        }
      }
      res.json(products);
    });
  } else {
    res.sendStatus(404);
  }
});

// update product
router.put('/', (req, res) => {
  var updateProduct = req.body;
  console.log("UPDATE SINGLE");
  Product.findOne({categoryId: updateProduct.categoryId, id: updateProduct.id}, function(err, product){
    if(err) return console.error(err);
    if(product){
      product.name = updateProduct.name;
      product.abbreviation = updateProduct.abbreviation;
      // if(updateProduct.name.length < 2){
      //   product.abbreviation = updateProduct.name;
      // } else {
      //   product.abbreviation = updateProduct.name.toUpperCase().substring(0, 1) + updateProduct.name.toLowerCase().substring(1, 2);
      // }
      product.requirements = updateProduct.requirements;
      product.specifications = updateProduct.specifications;
      product.save(function (err2){
        if(err2) return console.error(err2);
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(500);
      return;
    }
  });
});

function getRequest(url) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", url, false ); // false for synchronous request
  xmlHttp.send( null );
  // if(xmlHttp.status == 404){
  //   return null;
  // }
  return JSON.parse(xmlHttp.responseText);
}

module.exports = router;

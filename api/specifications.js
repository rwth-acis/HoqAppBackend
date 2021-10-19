const express = require('express');
const mongoose = require('mongoose');
mongoose.connect('mongodb://test:badmin@mongodb.docker-registry:27017/test?authSource=admin&retryWrites=true&w=majority', {useNewUrlParser: true});

const specificationSchema = require('../Schemas/specification-schema.js');
const Specification = mongoose.model('specification', specificationSchema);

const router = express.Router();

router.get('/', (req, res) => {
  if(req.query.categoryId){
    Specification.find({categoryId: req.query.categoryId}, function(err, specifications){
      res.json(specifications);
    });
  }
})

// create ts
router.post('/', (req, res) => {
  var newSpecification = req.body;
  console.log("SAVE SINGLE");
  var newSpec = new Specification({
    name: newSpecification.name,
    categoryId: newSpecification.categoryId,
    _id: newSpecification._id,
    minMax: newSpecification.minMax,
    target: newSpecification.target,
    requirements: newSpecification.requirements,
    specifications: newSpecification.specifications,
    created: Date.now()
  });
  Specification.findOne({_id: newSpecification._id}, function(err, spec){ // changeToDate findOne
    if(err) return console.error(err);
    if(spec){
      res.sendStatus(500);
      return;
    } else {
      newSpec.save(function (err) {
        if (err) return console.error(err);
        Specification.find({categoryId: newSpecification.categoryId}, function(err, specifications){
          if(err) return console.error(err);
          console.log("SAVE MANY (UPDATE)");
          for(var i = 0; i < specifications.length; i++){
            specifications[i].specifications.push({"_id": newSpec._id, "value": 0}); // changeToDate
            specifications[i].save(function (err2) {
              if (err2) return console.error(err2);
            });
          }
        });
        res.sendStatus(200);
      });
    }
  });
});

// update ts
router.put('/', (req, res) => {
  var updateSpecification = req.body;
  console.log("UPDATE SINGLE");
  Specification.findOne({_id: updateSpecification._id}, function(err, updateSpec){ // changeToDate findOne
    if(err) return console.error(err);
    if(updateSpec){
      updateSpec.name = updateSpecification.name;
      updateSpec.minMax = updateSpecification.minMax;
      updateSpec.target = updateSpecification.target;
      updateSpec.requirements = updateSpecification.requirements;
      updateSpec.specifications = updateSpecification.specifications;
      updateSpec.save(function (err2){
        if(err2) return console.error(err2);
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(500);
      return;
    }
  });
});

// delete
router.delete('/', (req, res) => {
  var deleteSpecification = req.body;
  console.log("DELETE ONCE");
  Specification.deleteOne({ _id: deleteSpecification._id }, function(err){ // changeToDate
    if(err) return console.error(err);
    console.log("DELETE CHILDREN (UPDATE)");
    Specification.find({}, function(err, specifications){
      if(err) return console.error(err);
      for(var i = 0; i < specifications.length; i++){
        var index = -1;
        for(var j = 0; j < specifications[i].specifications.length; j++){
          if(specifications[i].specifications[j]._id == deleteSpecification._id){ // changeToDate
            index = j;
          }
        }
        if(index > -1){
          console.log("Deleting " + specifications[i].specifications[index]);
          specifications[i].specifications.splice(index, 1);
        }
        specifications[i].save(function (err2) {
          if (err2) return console.error(err2);
        });
      }
      res.sendStatus(200);
    });
  });
});

module.exports = router;

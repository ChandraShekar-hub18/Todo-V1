//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://chandrashekar:chandu123@cluster0.ohokhxh.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
}

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const item = mongoose.model('item', itemsSchema)
const list = mongoose.model('list', listSchema)

const item1 = new item({
  name: "Welcome to your todo-list!"
})

const item2 = new item({
  name: "Hit the + button to add a new item."
})

const item3 = new item({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];



let workItems = [];
const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}))

app.get("/", (req, res) => {
  item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully inserted default items");
        }
      })
      res.redirect("/");
    } else {
      res.render("lists", {
        listTitle: "Today",
        newItems: foundItems
      });
    }
  })

})

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const Item = new item({
    name: itemName
  })
  if(listName === "Today"){
    Item.save();
    res.redirect("/");
  } else{
    list.findOne({name: listName},function(err, foundList){
      foundList.items.push(Item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }


})

app.post("/delete", (req, res) => {
  const checkeditemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    item.deleteOne({_id: checkeditemId}, (err)=>{
      if(err){
        console.log(err);
      } else{
        console.log("Succesfully delete item from items.");
      }
    })
    res.redirect("/");
  }
  else{
    list.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkeditemId}}},(err)=>{
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

})

app.get("/about", (req, res) => {
  res.render("about");
})

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  list.findOne({name: customListName}, function(err,foundItems){
    if(!err){
      if(!foundItems){
        const List = new list({
          name: customListName,
          items: defaultItems
        })
        List.save();
        res.redirect("/"+customListName);

      } else{
        res.render("lists",{listTitle: customListName, newItems: foundItems.items})
    }
  }

})
})


app.listen(process.env.PORT || 3000,()=>{
  console.log("Server started Succesfully");
});

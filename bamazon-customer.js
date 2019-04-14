var inquirer = require('inquirer');
var mysql = require('mysql');
var cTable = require('console.table');

// Pseudo Code - Customer:
//  Show customers the stock of items you have from the database (think SELECT * !)
//  connect to the bamazon database and display the list of items in stock and their price.
// Ask them what they would like to buy in a list
// After they select the item, reduce the stock of the item from database by 1

var connection = mysql.createConnection({
  host: 'localhost',

  port: 3306,

  user: 'root',

  password: 'fuckshitup',
  database: 'bamazon'
});

connection.connect(err => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}`);
  showItems();
});

function showItems() {
  var itemsAvailable = [];

  connection.query('SELECT * FROM items', (err, res) => {
    var i = 0;
    do {
      itemsAvailable.push(res[i].item_name);
      i++;
    } while (i < res.length);
    // console.log(itemsAvailable);
    inquirer
      .prompt([
        {
          name: 'item',
          type: 'list',
          message:
            'Welcome to Bamazon! Please choose from the folowing items: ',
          choices: itemsAvailable
        }
      ])
      .then(answer => {
        // console.log(answer.item);
        var itemSelected;
        itemSelected = answer.item;
        console.log(
          `Thank You for shopping at Bamazon. Your ${itemSelected} will be delivered ASAP!`
        );

        updateProduct(itemSelected);
      });
  });
}

function updateProduct() {
  var itemSelected;
  itemSelected = arguments[0];

  var query1 = connection.query(
    'SELECT stock FROM items WHERE ?',
    [
      {
        item_name: itemSelected
      }
    ],
    (err, res) => {
      var inStock;
      inStock = res[0].stock;
      //console.log(inStock);

      decreaseStock(itemSelected, inStock);
    }
  );
}

function decreaseStock() {
  var itemArg = arguments[0];
  var stockArg = arguments[1];
  console.log(itemArg);
  console.log(stockArg);

  var query = connection.query('UPDATE items SET ? WHERE ?', [
    {
      stock: stockArg - 1
    },
    {
      item_name: itemArg
    }
  ]);
  keepShopping();
}

function keepShopping() {
  var choices = ['Keep Shopping!', 'Exit'];
  inquirer
    .prompt([
      {
        name: 'choice',
        type: 'list',
        message: 'What would you liked to do now?',
        choices: choices
      }
    ])
    .then(answers => {
      switch (answers.choice) {
        case 'Keep Shopping!':
          showItems();
          break;
        case 'Exit':
          console.log('Thanks for Shopping at Bamazon. GoodBye!\n');
          connection.end();
          break;
      }
    });
}

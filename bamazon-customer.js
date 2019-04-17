var inquirer = require('inquirer');
var mysql = require('mysql');

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
        },
        {
          name: 'nums',
          type: 'input',
          message: 'How many units would you like to buy?'
        }
      ])
      .then(answer => {
        // console.log(answer.item);
        var itemSelected, numUnits;
        itemSelected = answer.item;
        numUnits = answer.nums;

        // check whether item is in stock!

        connection.query(
          `SELECT stock FROM items WHERE item_name = "${itemSelected}"`,
          (err, res) => {
            if (err) throw err;

            var stockLeft;
            stockLeft = res[0].stock;

            if (stockLeft > numUnits) {
              console.log(
                `Thank You for shopping at Bamazon. Your ${itemSelected} will be delivered to you ASAP!`
              );
              updateProduct(itemSelected, numUnits);
            } else {
              console.log(
                'Sorry, We are out of stock at the moment. Please check again later'
              );
              keepShopping();
            }
          }
        );
        // updateProduct(itemSelected);
      });
  });
}

function updateProduct() {
  var itemSelected, numUnits;
  itemSelected = arguments[0];
  numUnits = arguments[1];

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

      decreaseStock(itemSelected, inStock, numUnits);
    }
  );
}

function decreaseStock() {
  var itemArg = arguments[0];
  var stockArg = arguments[1];
  var numUnits = arguments[2];

  var query = connection.query('UPDATE items SET ? WHERE ?', [
    {
      stock: stockArg - numUnits
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

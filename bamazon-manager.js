var inquirer = require('inquirer');
var mysql = require('mysql');
var cTable = require('console.table');

/* Goal: Bamazon-manager
    when a manager launches the app, they should be able to see the options to view inventory, add to inventory or Exit console

*/

var connection = mysql.createConnection({
  host: 'localhost',

  port: 3306,

  user: 'root',

  password: 'fuckshitup',
  database: 'bamazon'
});

connection.connect(err => {
  console.log(`connection as thread ${connection.threadId}`);
  console.log(`Welcome to your store. Here is what you can do from here: `);
  showOptions();
});

// see the list of options

function showOptions() {
  const startingOptions = [
    'View Inventory',
    'Add to inventory',
    'Exit Console'
  ];

  inquirer
    .prompt([
      {
        name: 'start',
        message: 'What would you like to do from here?',
        type: 'list',
        choices: startingOptions
      }
    ])
    .then(ok => {
      let managerChoice;

      managerChoice = ok.start;

      switch (managerChoice) {
        case 'View Inventory':
          viewInventory();
          break;
        case 'Add to inventory':
          getItems();
          break;
        case 'Exit Console':
          console.log('Thanks for using bamazon-manager. GoodBye!');
          connection.end();
          break;
      }
    });
}

function viewInventory() {
  connection.query('Select * FROM items', (err, res) => {
    if (!err) {
      console.table(res);
    }
    showOptions();
  });
}

function getItems() {
  // Add to stock of current items or add a completely new item?
  // Let's try adding to current items

  // First ask what item they want to add to

  let itemsInInventory = [];

  connection.query('SELECT item_name FROM items', (err, res) => {
    if (!err) {
      let i = 0;
      do {
        itemsInInventory.push(res[i].item_name);
        i++;
      } while (i < res.length);
    }
    console.log(itemsInInventory);
    addStuff(itemsInInventory);
  });
}

function addStuff() {
  let itemsAvailable = [];

  let i = 0;
  do {
    itemsAvailable.push(arguments[0][i]);
    i++;
  } while (i < arguments[0].length);

  inquirer
    .prompt([
      {
        name: 'itemAdd',
        message: 'Select Which item you want to add stock to: ',
        type: 'list',
        choices: itemsAvailable
      },
      {
        name: 'how_much',
        message: 'Enter new stock number',
        type: 'input',
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(answer => {
      //console.log(answer.itemAdd, answer.how_much);
      connection.query(
        `UPDATE items SET ? WHERE item_name = '${answer.itemAdd}'`,
        {
          stock: answer.how_much
        },
        function(err, res) {
          if (err) throw err;
          console.log('Inventory Updated');
          showOptions();
        }
      );
    });
}

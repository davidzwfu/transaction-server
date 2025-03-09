const database = require('./database');

function checkIfLocked(key, user) {
  if (database.locks[key] && database.locks[key] != user)
    throw new Error('Resource is locked by another user');
}

function putValue(key, value, user) {
  if (database.transactions[user]) {
    database.locks[key] = user;
    database.transactions[user].push({ command: 'PUT', key, value });
  }
  else
    database.store[key] = value;
}

function getValue(key, user) {
  if (!database.store[key])
    throw new Error('Key does not exist');

  if (database.transactions[user] && !database.locks[key])
    database.locks[key] = user;

  return database.store[key];
}

function deleteValue(key, user) {
  if (!database.store[key])
    throw new Error('Key does not exist');
  
  if (database.transactions[user]) {
    database.locks[key] = user;
    database.transactions[user].push({ command: 'DEL', key });
  }
  else
    delete database.store[key];
}

function startTransaction(user) {
  if (database.transactions[user])
    throw new Error('Transaction already in progress');

  database.transactions[user] = [];
}

function commitTransaction(user) {
  if (!database.transactions[user])
    throw new Error('No transaction in progress');
    
  const copyStore = structuredClone(database.store);
  for (const transaction of database.transactions[user]) {
    switch (transaction.command) {
      case 'PUT':
        copyStore[transaction.key] = transaction.value;
        break;
      case 'DEL':
        delete copyStore[transaction.key];
        break;
    }
    delete database.locks[transaction.key];
  }
  database.store = copyStore;
  delete database.transactions[user];
}

function rollbackTransaction(user) {
  if (!database.transactions[user])
    throw new Error('No transaction in progress');

  for (const transaction of database.transactions[user]) {
    delete database.locks[transaction.key];
  }
  database.transactions[user] = [];
}

function disconnectUser(user) {
  for (const transaction of database.transactions[user]) {
    delete database.locks[transaction.key];
  }
  delete database.transactions[user];
}

module.exports = {
  checkIfLocked,
  putValue,
  getValue,
  deleteValue,
  startTransaction,
  commitTransaction,
  rollbackTransaction,
  disconnectUser,
}

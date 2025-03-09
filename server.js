const net = require('net');

const PORT = 3000;
const server = net.createServer();

const { parseArguments, formatResponse } = require('./utils');
const { 
  putValue,
  getValue,
  checkIfLocked,
  deleteValue,
  startTransaction,
  commitTransaction,
  rollbackTransaction,
  disconnectUser,
} = require('./functions');

server.on('connection', (socket) => {
  const user = socket.remotePort;

  socket.write('Connected to Key/Value Data Server\r\n\r\n');
  socket.write(`Data Modification Commands:\r\nPUT [key] [value]\r\nGET [key]\r\nDEL [key]\r\n\r\n`);
  socket.write(`Transaction Control Commands:\r\nSTART\r\nCOMMIT\r\nROLLBACK\r\n\r\n`);
  
  socket.on('data', (data) => {
    const { command, key, value } = parseArguments(data);

    try {
      switch (command) {
        case 'PUT':
          checkIfLocked(key, user);
          putValue(key, value, user);
          socket.write(
            formatResponse({ status: 'Ok' })
          );
          break;
        case 'GET':
          const result = getValue(key, user);
          socket.write(
            formatResponse({ status: 'Ok', result })
          );
          break;
        case 'DEL':
          checkIfLocked(key, user);
          deleteValue(key, user);
          socket.write(
            formatResponse({ status: 'Ok' })
          );
          break;
        case 'START':
          startTransaction(user);
          socket.write(
            formatResponse({ status: 'Ok', mesg: 'Transaction started' })
          );
          break;
        case 'COMMIT':
          commitTransaction(user);
          socket.write(
            formatResponse({ status: 'Ok', mesg: 'Transaction committed' })
          );
          break;
        case 'ROLLBACK':
          rollbackTransaction(user);
          socket.write(
            formatResponse({ status: 'Ok', mesg: 'Transaction rolled back' })
          );
          break;
        default:
          throw new Error('Invalid command')
      }
    }
    catch (e) {
      socket.write(
        formatResponse({ status: 'Error', mesg: e.message })
      );
    }
  });

  socket.on('end', () => {
    disconnectUser(user);
    console.log('Connection closed: ' + user);
  });
});

server.listen(PORT, () => {
  console.log('TCP Server is running on port ' + PORT + '.');
});

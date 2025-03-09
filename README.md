## Setup

Download and install [Node.js](https://nodejs.org/en/download).

Install packages and run server.
```bash
npm install

npm start
```

Open a socket connection using a tool of your choice (e.g. PuTTY) and start sending commands.

## Commands

#### Data Modification Commands

PUT [key] [value]

GET [key]

DEL [key]

#### Transaction Control Commands

START

COMMIT

ROLLBACK

## Technical explanation

- Commands made during a transaction are logged to `transactions` to be processed when a subsequent COMMIT is executed.
  - Transactions are atomic so modifications are made all at once
- In addition, the affected row is locked (tracked by `locks`) so it cannot be modified by others until the transaction is complete.
- During a COMMIT, changes are first made to a copy of the data store before overwriting the original. In case of an error, partial changes will not be made to the original.
- Values can be of type string, number, or json (parsed with `JSON.parse()`).
- Transaction ids are determined by using the connected user's port (`socket.remotePort`).

## Assumptions

- Lock rows that are being accessed (GET, PUT, DEL) during a transaction
  - To prevent conflicts between multiple users accessing the same row
- Uses pessimistic locking - locked rows cannot be modified by other users (reading values is not blocked)
- On user disconnect, release locks and discard any pending changes
  - Since we are tracking transactions with the user's port, there isn't a reliable way to resume disconnected transactions
  

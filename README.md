# node-logger

## How to install
    git clone https://github.com/taka-wang/node-logger.git
    cd node-logger
    npm install

## How to run
    cd node-logger
    node index.js

## Deployment
    cd node-logger
    forever start index.js
    forever start mqlogger.js

## How to install node.js and forever on ubuntu
- sudo apt-get install git
- sudo apt-get update
- sudo apt-get install build-essential
- sudo apt-get install libssl-dev
- sudo apt-get install python-software-properties
- sudo add-apt-repository ppa:chris-lea/node.js
- sudo apt-get update
- sudo apt-get install nodejs
- sudo npm install forever -g

## Notice
For CORS, please add the following middleware
```
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});
```

## How to install mongodb

- [X86](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/)
- [ARM](https://github.com/hereshem/mongoPi)

## MIT License

## Pattern
Received '{"scale":"206.7","nearest":"213","qrcode":"hello123"}' on '/lab3/log/'
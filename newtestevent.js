// THIS IS THE LEGACY FORM TO SEND TRANSACTIONS
// Loading dependencies
var Web3 = require("web3");

const db = require('./config/database')
const { v4: uuidv4 } = require('uuid');

const { Queue } = require("dynamic-queue");

var outs = [];


const newProvider = () => new Web3.providers.WebsocketProvider('wss://ropsten.infura.io/ws/v3/8f323d5273e54693835711fb2c4c509a', {
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 5,
    onTimeout: false,
  },
})
var web3 = new Web3(newProvider());

const checkActive = () => {
  if (!web3.currentProvider.connected) {
    web3.setProvider(newProvider())
  }
}

setInterval(checkActive, 2000)

async function primaryContract() {
  // Infura rinkeby's url

  var PrimaryAddress = require("./abis/primary.json");

  var abiArray = PrimaryAddress.abi;
  
  var contractAddress = "0xD2Ef5D792bB8Ab4CdDc2e29d46e00a41Bdcd300E";

  var contract = new web3.eth.Contract(abiArray, contractAddress);

  // web3.eth.subscribe("logs", {
  //   fromBlock: 0
  // }, function(error, event){ 
  //     console.log(event); 
  // }).on('data', function(event){
  //     console.log(event); // same results as the optional callback above
  // }).on('changed', function(event){
  //     // remove event from local database
  // }).on('error', console.error);


  contract.events.Buy({
    fromBlock: 0
  }, function(error, event){ 
      var newdate = new Date();
      console.log('Primary Buy');
      console.log('Event Creation Date ', newdate.toISOString())
      console.log("Event Address ", event.address)
      console.log('Event Block Number', event.blockNumber) 
      console.log('Event sale id', event.returnValues.saleId) 
      console.log('Event nft id', event.returnValues.nftContract) 
      console.log('--------------') 
      
  })
  .on("connected", function(subscriptionId){
      console.log('primary Buy event Connected ');
      console.log(subscriptionId);
  })
  .on('data', function(event){
    var newdate = new Date();
    

    //console.log(event); // same results as the optional callback above
  })
  .on('changed', function(event){
      // remove event from local database
  })
  .on('error', console.error);

}

async function AddedToMarketplace(event){
  const newdate = new Date();
  console.log('Second ', event.event); 
  console.log('Event Creation Date ', newdate.toISOString())
  console.log("Event Address ", event.address)
  console.log('Event Block Number', event.blockNumber) 
  console.log('Event sale id', event.returnValues.saleId) 
  console.log('Event nft id', event.returnValues.nftContract) 
  let response = await db.query('INSERT INTO lognfts(id, nft_id, blocknumber, address, saleid, date, event, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [uuidv4(),event.returnValues.nftContract, event.blockNumber, event.address, event.returnValues.saleId, newdate.toISOString(), 'AddedToMarketplace', 'add'])
  console.log('Add done');
  console.log('--------------') 
  return response;
}

async function Buyfunction(event){
  const newdate = new Date();
  console.log('Second ', event.event); 
  console.log('Event Creation Date ', newdate.toISOString())
  console.log("Event Address ", event.address)
  console.log('Event Block Number', event.blockNumber) 
  console.log('Event sale id', event.returnValues.saleId) 
  console.log('Event nft id', event.returnValues.nftContract) 
  let response = await db.query('UPDATE lognfts set status=$2 where blocknumber=$1', [event.blockNumber, 'buy'])
  console.log('buy done');
  console.log('--------------') 
  return response;
}

async function priceUpdated(event){
  const newdate = new Date();
  console.log('Second ', event.event); 
  console.log('Event Creation Date ', newdate.toISOString())
  console.log("Event Address ", event.address)
  console.log('Event Block Number', event.blockNumber) 
  console.log('Event sale id', event.returnValues.saleId) 
  console.log('Event nft id', event.returnValues.nftContract) 
  let response = await db.query('UPDATE lognfts set status=$2 where blocknumber=$1', [event.blockNumber, 'price update'])
  console.log('price updated done');
  console.log('--------------') 
  return response;
}

async function removedFromMarketplace(event){
  const newdate = new Date();
  console.log('Second ', event.event); 
  console.log('Event Creation Date ', newdate.toISOString())
  console.log("Event Address ", event.address)
  console.log('Event Block Number', event.blockNumber) 
  console.log('Event sale id', event.returnValues.saleId) 
  console.log('Event nft id', event.returnValues.nftContract) 
  let response = await db.query('UPDATE lognfts set status=$2 where blocknumber=$1', [event.blockNumber, 'remove'])
  console.log('remove done');
  console.log('--------------') 
  return response;
}

var queue = new Queue((next) => {
    outs.push("Hello, World!");
    next();
});

// const WaitAllContractEventGet = function(myevent) {
//     return new Promise(function(resolve, reject) {
//         myevent.on('data', async function(event){
//             console.log('check async..')
//             if(event.event == 'AddedToMarketplace'){
//               await AddedToMarketplace(event);
//               resolve()
//             }

//             if(event.event == 'Buy'){
//               await Buyfunction(event);
//               resolve()
//             }

//             if(event.event == 'PriceUpdated'){
//               await priceUpdated(event);
//               resolve()
//             }

//             if(event.event == 'RemovedFromMarketplace'){
//               await removedFromMarketplace(event);
//               resolve()
//             }

//         })
//         .on('changed', function(event){
//             // remove event from local database
//         })
//         .on('error', console.error);
//     });
// };



async function secondaryContract(){
  var SecondaryAddress = require("./abis/secondary.json");

  var abiArray = SecondaryAddress.abi;
  var secondContractAddress = "0x044eCCd491a0C8Ab01aD3B198c5fD06028020Af7";

  var secondContract = new web3.eth.Contract(abiArray, secondContractAddress);
  //console.log('secondary contract ', contract);

  let events = secondContract.events.allEvents({fromBlock: 0, toBlock: 'latest'});

  //const log_info = await WaitAllContractEventGet(events);
  events.on("connected", function(subscriptionId){
      console.log('second event Buy Connected ');
      console.log(subscriptionId);
  })
  .on('data', async function(event){
      console.log('check async..')
      if(event.event == 'AddedToMarketplace'){
        queue.push(async (next) => {
          var result = await AddedToMarketplace(event);
          next();
        })
      }

      if(event.event == 'Buy'){
        queue.push(async (next) => {
          var result = await Buyfunction(event);
          next();
        })
      }

      if(event.event == 'PriceUpdated'){
        queue.push(async (next) => {
          var result = await priceUpdated(event);
          next();
        })
      }

      if(event.event == 'RemovedFromMarketplace'){
        queue.push(async (next) => {
          var result = await removedFromMarketplace(event);
          next();
        })
      }
  })
  .on('changed', function(event){
      // remove event from local database
  })
  .on('error', console.error);


  // secondContract.getPastEvents("AllEvents",{
  //   fromBlock: 0
  // },
  // (error, events) => {
  //     if (error)
  //         console.log('Error getting events: ' + error);
  //     else{
  //       for(let item of events){
  //         var newdate = new Date();
  //         if(item.event == 'AddedToMarketplace'){
  //           console.log('Second ', item.event); 
  //           console.log('Event Creation Date ', newdate.toISOString())
  //           console.log("Event Address ", item.address)
  //           console.log('Event Block Number', item.blockNumber) 
  //           console.log('Event sale id', item.returnValues.saleId) 
  //           console.log('Event nft id', item.returnValues.nftContract) 
  //           console.log('--------------') 
  //           db.query('INSERT INTO lognfts(id, nft_id, blocknumber, address, saleid, date, event) VALUES ($1, $2, $3, $4, $5, $6, $7)', [uuidv4(),item.returnValues.nftContract, item.blockNumber, item.address, item.returnValues.saleId, newdate.toISOString(), 'AddedToMarketplace'])
  //           .then((result) => {
  //             console.log('Saving Done...')
  //           })
  //           .catch((err) => {
  //             console.log('err ', err);
  //           })
  //         }

  //         if(item.event == 'Buy'){
  //           console.log('Second ', item.event); 
  //           console.log('Event Creation Date ', newdate.toISOString())
  //           console.log("Event Address ", item.address)
  //           console.log('Event Block Number', item.blockNumber) 
  //           console.log('Event sale id', item.returnValues.saleId) 
  //           console.log('Event nft id', item.returnValues.nftContract) 
  //           console.log('--------------') 
  //           db.query('select * from lognfts where blocknumber=$1', [item.blockNumber])
  //           .then((result) => {
  //             console.log('Data get form database')
  //           })
  //           .catch((err) => {
  //             console.log('err ', err);
  //           })
  //         }

  //         if(item.event == 'PriceUpdated'){
  //           console.log('Second ', item.event); 
  //           console.log('Event Creation Date ', newdate.toISOString())
  //           console.log("Event Address ", item.address)
  //           console.log('Event Block Number', item.blockNumber) 
  //           console.log('Event sale id', item.returnValues.saleId) 
  //           console.log('Event nft id', item.returnValues.nftContract) 
  //           console.log('--------------') 
  //           db.query('update lognfts set address=$2 where blocknumber=$1', [item.blockNumber, item.address])
  //           .then((result) => {
  //             console.log('Data get form database')
  //           })
  //           .catch((err) => {
  //             console.log('err ', err);
  //           })
  //         }

  //         if(item.event == 'RemovedFromMarketplace'){
  //           console.log('Second ', item.event); 
  //           console.log('Event Creation Date ', newdate.toISOString())
  //           console.log("Event Address ", item.address)
  //           console.log('Event Block Number', item.blockNumber) 
  //           console.log('Event sale id', item.returnValues.saleId) 
  //           console.log('Event nft id', item.returnValues.nftContract) 
  //           console.log('--------------') 
  //         }
  //       }
  //     }
  // });


  // await secondContract.events.AddedToMarketplace({
  //   fromBlock: 0
  // }, function(error, event){ 
  //     //console.log(event); 
  //     var newdate = new Date();
  //     console.log('Second AddedToMarketplace'); 
  //     console.log('Event Creation Date ', newdate.toISOString())
  //     console.log("Event Address ", event.address)
  //     console.log('Event Block Number', event.blockNumber) 
  //     console.log('Event sale id', event.returnValues.saleId) 
  //     console.log('Event nft id', event.returnValues.nftContract) 
  //     console.log('--------------') 
  //     // db.query('INSERT INTO lognfts(id, nft_id, blocknumber, address, saleid, date, event) VALUES ($1, $2, $3, $4, $5, $6, $7)', [uuidv4(),event.returnValues.nftContract, event.blockNumber, event.address, event.returnValues.saleId, newdate.toISOString(), 'AddedToMarketplace'])
  //     // .then((result) => {
  //     //   console.log('Saving Done...')
  //     // })
  //     // .catch((err) => {
  //     //   console.log('err ', err);
  //     // })

  // })
  // .on("connected", function(subscriptionId){
  //     console.log('second event AddedToMarketplace Connected ');
  //     console.log(subscriptionId);
  // })
  // .on('data', function(event){
  //     //console.log(event); // same results as the optional callback above
  // })
  // .on('changed', function(event){
  //     // remove event from local database
  // })
  // .on('error', console.error);


  // await secondContract.events.Buy({
  //   fromBlock: 0
  // }, function(error, event){ 
  //     //console.log(event); 
  //     var newdate = new Date();
  //     console.log('Second Buy');
  //     console.log('Event Creation Date ', newdate.toISOString())
  //     console.log("Event Address ", event.address)
  //     console.log('Event Block Number', event.blockNumber) 
  //     console.log('Event sale id', event.returnValues.saleId) 
  //     console.log('Event nft id', event.returnValues.nftContract) 
  //     console.log('--------------') 
  // })
  // .on("connected", function(subscriptionId){
  //     console.log('second event Buy Connected ');
  //     console.log(subscriptionId);
  // })
  // .on('data', function(event){
  //     //console.log(event); // same results as the optional callback above
  // })
  // .on('changed', function(event){
  //     // remove event from local database
  // })
  // .on('error', console.error);

  // await secondContract.events.PriceUpdated({
  //   fromBlock: 0
  // }, function(error, event){ 
  //     //console.log(event); 
  //     var newdate = new Date();
  //     console.log('Second PriceUpdated');
  //     console.log('Event Creation Date ', newdate.toISOString())
  //     console.log("Event Address ", event.address)
  //     console.log('Event Block Number', event.blockNumber) 
  //     console.log('Event sale id', event.returnValues.saleId) 
  //     console.log('Event nft id', event.returnValues.nftContract) 
  //     console.log('--------------') 
  // })
  // .on("connected", function(subscriptionId){
  //     console.log('second event PriceUpdated Connected ');
  //     console.log(subscriptionId);
  // })
  // .on('data', function(event){
  //     //console.log(event); // same results as the optional callback above
  // })
  // .on('changed', function(event){
  //     // remove event from local database
  // })
  // .on('error', console.error);

  // await secondContract.events.RemovedFromMarketplace({
  //   fromBlock: 0
  // }, function(error, event){ 
  //     //console.log(event);
  //     var newdate = new Date();
  //     console.log('Second RemovedFromMarketplace');
  //     console.log('Event Creation Date ', newdate.toISOString())
  //     console.log("Event Address ", event.address)
  //     console.log('Event Block Number', event.blockNumber) 
  //     console.log('Event sale id', event.returnValues.saleId) 
  //     console.log('Event nft id', event.returnValues.nftContract) 
  //     console.log('--------------') 
  // })
  // .on("connected", function(subscriptionId){
  //     console.log('second event RemovedFromMarketplace Connected ');
  //     console.log(subscriptionId);
  // })
  // .on('data', function(event){
  //     //console.log(event); // same results as the optional callback above
  // })
  // .on('changed', function(event){
  //     // remove event from local database
  // })
  // .on('error', console.error);
}

//primaryContract();
secondaryContract();
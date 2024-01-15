// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
const SupplyChain = artifacts.require("SupplyChain");

contract("SupplyChain", (accounts) => {
  // Declare few constants and assign a few sample accounts generated by ganache-cli

  let supplyChainInstance;
  const ownerID = accounts[0];
  const originFarmerID = accounts[1];
  let sku = 1;
  let upc = 1;

  const productID = sku + upc;
  const productNotes = "Best beans for Espresso";
  const productPrice = web3.utils.toWei("0", "ether");
  let itemState = 0;
  const distributorID = accounts[2];
  const retailerID = accounts[3];
  const consumerID = accounts[4];
  const emptyAddress = "0x0000000000000000000000000000000000000000";

  const originFarmName = "John Doe";
  const originFarmInformation = "Yarray Valley";
  const originFarmLatitude = "-38.239770";
  const originFarmLongitude = "144.341490";

  beforeEach(async () => {
    // create instance of the contract
    supplyChainInstance = await SupplyChain.deployed();
  });

  console.log("Contract Owner: accounts[0] ", accounts[0]);
  console.log("Farmer: accounts[1] ", accounts[1]);
  console.log("Distributor: accounts[2] ", accounts[2]);
  console.log("Retailer: accounts[3] ", accounts[3]);
  console.log("Consumer: accounts[4] ", accounts[4]);

  // 1st Test
  it("Testing smart contract function harvestItem() that al lows a farmer to harvest coffee", async () => {
    //create farmer
    await supplyChainInstance.addFarmer(originFarmerID, {
      from: ownerID,
    });

    // Mark an item as Harvested by calling function harvestItem()
    const tx = await supplyChainInstance.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      { from: originFarmerID }
    );

    // Get the transaction receipt to access the emitted events
    const receipt = await web3.eth.getTransactionReceipt(tx.tx);
    //CHECK IF  Harvested EVENT WAS EMITTED
    // Watch the emitted event Harvested()
    const events = await supplyChainInstance.getPastEvents("Harvested", {
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    // Ensure that at least one Harvested event was emitted
    assert.equal(events.length, 1, "Harvested event should be emitted");

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChainInstance.fetchItemBufferOne.call(
      upc
    );
    const resultBufferTwo = await supplyChainInstance.fetchItemBufferTwo.call(
      upc
    );

    // Verify the result set for resultBufferOne
    assert.equal(2, resultBufferOne[0].toNumber(), "Error: Invalid item SKU");
    assert.equal(upc, resultBufferOne[1].toNumber(), "Error: Invalid item UPC");
    assert.equal(emptyAddress, resultBufferOne[2], "Error: Invalid ownerID"); //emptyAddress
    assert.equal(
      originFarmerID,
      resultBufferOne[3],
      "Error: Invalid originFarmerID"
    );
    assert.equal(
      originFarmName,
      resultBufferOne[4],
      "Error: Invalid originFarmName"
    );
    assert.equal(
      originFarmInformation,
      resultBufferOne[5],
      "Error: Invalid originFarmInformation"
    );
    assert.equal(
      originFarmLatitude,
      resultBufferOne[6],
      "Error: Invalid originFarmLatitude"
    );
    assert.equal(
      originFarmLongitude,
      resultBufferOne[7],
      "Error: Invalid originFarmLongitude"
    );

    // Verify the result set for resultBufferTwo
    assert.equal(2, resultBufferTwo[0].toNumber(), "Error: Invalid item SKU");
    assert.equal(upc, resultBufferTwo[1].toNumber(), "Error: Invalid item UPC");
    assert.equal(3, resultBufferTwo[2].toNumber(), "Error: Invalid productID");
    assert.equal(
      productNotes,
      resultBufferTwo[3],
      "Error: Invalid productNotes"
    );
    assert.equal(
      productPrice,
      resultBufferTwo[4].toNumber(),
      "Error: Invalid productPrice"
    );
    assert.equal(
      itemState,
      resultBufferTwo[5].toNumber(),
      "Error: Invalid itemState"
    );
    assert.equal(
      emptyAddress,
      resultBufferTwo[6],
      "Error: Invalid distributorID"
    );
    assert.equal(emptyAddress, resultBufferTwo[7], "Error: Invalid retailerID");
    assert.equal(emptyAddress, resultBufferTwo[8], "Error: Invalid consumerID");
  });

  // 2nd Test
  it("Testing smart contract function processItem that allows a farmer to process coffee", async () => {
    // Mark an item as Harvested by calling function harvestItem()
    const txHarvested = await supplyChainInstance.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      { from: originFarmerID }
    );

    // Get the transaction receipt to access the emitted events
    const receipt = await web3.eth.getTransactionReceipt(txHarvested.tx);
    //CHECK IF  Harvested EVENT WAS EMITTED
    // Watch the emitted event Harvested()
    const events = await supplyChainInstance.getPastEvents("Harvested", {
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    // Ensure that at least one Harvested event was emitted
    assert.equal(events.length, 1, "Harvested event should be emitted");

    // Mark an item as Processed by calling function processItem()
    const txProcessed = await supplyChainInstance.processItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt2 = await web3.eth.getTransactionReceipt(txProcessed.tx);
    //CHECK IF  Processed EVENT WAS EMITTED
    // Watch the emitted event Processed()
    const events2 = await supplyChainInstance.getPastEvents("Processed", {
      fromBlock: receipt2.blockNumber,
      toBlock: receipt2.blockNumber,
    });

    // Ensure that at least one Processed event was emitted
    assert.equal(events2.length, 1, "Processed event should be emitted");

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    // Verify the result set
    const resultBufferTwo = await supplyChainInstance.fetchItemBufferTwo.call(
      upc
    );

    //getting the item state
    assert.equal(
      1,
      resultBufferTwo[5].toNumber(),
      "Item should be in Processed state that is 1"
    );
  });

  // // 3rd Test
  it("Testing smart contract function packItem() that allows a farmer to pack coffee", async () => {
    // Mark an item as Harvested by calling function harvestItem()
    const txHarvested = await supplyChainInstance.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      { from: originFarmerID }
    );

    // Get the transaction receipt to access the emitted events
    const receipt = await web3.eth.getTransactionReceipt(txHarvested.tx);
    //CHECK IF  Harvested EVENT WAS EMITTED
    // Watch the emitted event Harvested()
    const events = await supplyChainInstance.getPastEvents("Harvested", {
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    // Ensure that at least one Harvested event was emitted
    assert.equal(events.length, 1, "Harvested event should be emitted");

    // Mark an item as Processed by calling function processItem()
    const txProcessed = await supplyChainInstance.processItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt2 = await web3.eth.getTransactionReceipt(txProcessed.tx);
    //CHECK IF  Processed EVENT WAS EMITTED
    // Watch the emitted event Processed()
    const events2 = await supplyChainInstance.getPastEvents("Processed", {
      fromBlock: receipt2.blockNumber,
      toBlock: receipt2.blockNumber,
    });

    // Ensure that at least one Processed event was emitted
    assert.equal(events2.length, 1, "Processed event should be emitted");

    // Mark an item as Packed by calling function packItem()
    const txPacked = await supplyChainInstance.packItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt3 = await web3.eth.getTransactionReceipt(txPacked.tx);
    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events3 = await supplyChainInstance.getPastEvents("Packed", {
      fromBlock: receipt3.blockNumber,
      toBlock: receipt3.blockNumber,
    });

    // Ensure that at least one Packed event was emitted
    assert.equal(events3.length, 1, "Packed event should be emitted");

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    // Verify the result set
    const resultBufferTwo2 = await supplyChainInstance.fetchItemBufferTwo.call(
      upc
    );

    //getting the item state
    assert.equal(
      2,
      resultBufferTwo2[5].toNumber(),
      "Item should be in Packed state that is 2"
    );
  });

  // // 4th Test
  it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async () => {
    // Mark an item as Harvested by calling function harvestItem()
    const txHarvested = await supplyChainInstance.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      { from: originFarmerID }
    );

    // Get the transaction receipt to access the emitted events
    const receipt = await web3.eth.getTransactionReceipt(txHarvested.tx);
    //CHECK IF  Harvested EVENT WAS EMITTED
    // Watch the emitted event Harvested()
    const events = await supplyChainInstance.getPastEvents("Harvested", {
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    // Ensure that at least one Harvested event was emitted
    assert.equal(events.length, 1, "Harvested event should be emitted");

    // Mark an item as Processed by calling function processItem()
    const txProcessed = await supplyChainInstance.processItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt2 = await web3.eth.getTransactionReceipt(txProcessed.tx);
    //CHECK IF  Processed EVENT WAS EMITTED
    // Watch the emitted event Processed()
    const events2 = await supplyChainInstance.getPastEvents("Processed", {
      fromBlock: receipt2.blockNumber,
      toBlock: receipt2.blockNumber,
    });

    // Ensure that at least one Processed event was emitted
    assert.equal(events2.length, 1, "Processed event should be emitted");

    // Mark an item as Packed by calling function packItem()
    const txPacked = await supplyChainInstance.packItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt3 = await web3.eth.getTransactionReceipt(txPacked.tx);
    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events3 = await supplyChainInstance.getPastEvents("Packed", {
      fromBlock: receipt3.blockNumber,
      toBlock: receipt3.blockNumber,
    });

    // Ensure that at least one Packed event was emitted
    assert.equal(events3.length, 1, "Packed event should be emitted");

    const price = web3.utils.toWei("0.00007", "ether");

    // Mark an item as ForSale by calling function sellItem()
    const txForSale = await supplyChainInstance.sellItem(upc, price, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt4 = await web3.eth.getTransactionReceipt(txForSale.tx);

    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events4 = await supplyChainInstance.getPastEvents("ForSale", {
      fromBlock: receipt4.blockNumber,
      toBlock: receipt4.blockNumber,
    });
    // Ensure that at least one ForSale event was emitted
    assert.equal(events4.length, 1, "ForSale event should be emitted");

    // Retrieve the just now saved item from blockchain by calling function fetchItem()

    // Verify the result set
    const resultBufferTwo2 = await supplyChainInstance.fetchItemBufferTwo.call(
      upc
    );
    //getting product price
    assert.equal(price, resultBufferTwo2[4].toNumber());
    //getting the item state
    assert.equal(
      3,
      resultBufferTwo2[5].toNumber(),
      "Item should be in ForSale state that is 3"
    );
  });

  // // 5th Test
  it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async () => {
    // //create distributor
    await supplyChainInstance.addDistributor(distributorID, {
      from: ownerID,
    });

    // Mark an item as Harvested by calling function harvestItem()
    const txHarvested = await supplyChainInstance.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      { from: originFarmerID }
    );

    // Get the transaction receipt to access the emitted events
    const receipt = await web3.eth.getTransactionReceipt(txHarvested.tx);
    //CHECK IF  Harvested EVENT WAS EMITTED
    // Watch the emitted event Harvested()
    const events = await supplyChainInstance.getPastEvents("Harvested", {
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    // Ensure that at least one Harvested event was emitted
    assert.equal(events.length, 1, "Harvested event should be emitted");

    // Mark an item as Processed by calling function processItem()
    const txProcessed = await supplyChainInstance.processItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt2 = await web3.eth.getTransactionReceipt(txProcessed.tx);
    //CHECK IF  Processed EVENT WAS EMITTED
    // Watch the emitted event Processed()
    const events2 = await supplyChainInstance.getPastEvents("Processed", {
      fromBlock: receipt2.blockNumber,
      toBlock: receipt2.blockNumber,
    });

    // Ensure that at least one Processed event was emitted
    assert.equal(events2.length, 1, "Processed event should be emitted");

    // Mark an item as Packed by calling function packItem()
    const txPacked = await supplyChainInstance.packItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt3 = await web3.eth.getTransactionReceipt(txPacked.tx);
    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events3 = await supplyChainInstance.getPastEvents("Packed", {
      fromBlock: receipt3.blockNumber,
      toBlock: receipt3.blockNumber,
    });

    // Ensure that at least one Packed event was emitted
    assert.equal(events3.length, 1, "Packed event should be emitted");

    const price = web3.utils.toWei("0.00007", "ether");

    // Mark an item as ForSale by calling function sellItem()
    const txForSale = await supplyChainInstance.sellItem(upc, price, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt4 = await web3.eth.getTransactionReceipt(txForSale.tx);

    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events4 = await supplyChainInstance.getPastEvents("ForSale", {
      fromBlock: receipt4.blockNumber,
      toBlock: receipt4.blockNumber,
    });
    // Ensure that at least one ForSale event was emitted
    assert.equal(events4.length, 1, "ForSale event should be emitted");

    const amount = web3.utils.toWei("0.00008", "ether");

    //fetch the item
    const resultBufferTwo2 = await supplyChainInstance.fetchItemBufferTwo.call(
      upc
    );

    //getting product price
    const productPrice = resultBufferTwo2[4].toNumber();
    const balance = amount - productPrice;
    assert(
      amount >= productPrice,
      "Amount should be greater or equal product price"
    );

    //buy the item
    const txBuyItem = await supplyChainInstance.buyItem(upc, {
      from: distributorID,
      value: productPrice,
    });

    //send balance to the distributor i.e the change
    await web3.eth.sendTransaction({
      from: distributorID,
      to: distributorID,
      value: balance,
    });

    // Get the transaction receipt to access the emitted events
    const receipt5 = await web3.eth.getTransactionReceipt(txBuyItem.tx);
    //checked if Sold event was emitted
    // Watch the emitted event Sold()
    const events5 = await supplyChainInstance.getPastEvents("Sold", {
      fromBlock: receipt5.blockNumber,
      toBlock: receipt5.blockNumber,
    });

    // Ensure that at least one Sold event was emitted
    assert.equal(events5.length, 1, "Sold event should be emitted");

    //fetch the item
    const resultBufferTwo2AfterSold =
      await supplyChainInstance.fetchItemBufferTwo.call(upc);
    const resultBufferOneAfterSold =
      await supplyChainInstance.fetchItemBufferOne.call(upc);

    const newOwnerId = resultBufferOneAfterSold[2];
    const newDistributorId = resultBufferTwo2AfterSold[6];
    const itemState = resultBufferTwo2AfterSold[5].toNumber();

    // Verify the result set
    assert.equal(
      newOwnerId,
      distributorID,
      "New owner should be the distributor"
    );

    assert.equal(
      newDistributorId,
      distributorID,
      "New distributor should be the distributor"
    );

    assert.equal(itemState, 4, "Item should be in Sold state that is 4");
  });

  // // 6th Test
  it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async () => {
    // Mark an item as Harvested by calling function harvestItem()
    const txHarvested = await supplyChainInstance.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      { from: originFarmerID }
    );

    // Get the transaction receipt to access the emitted events
    const receipt = await web3.eth.getTransactionReceipt(txHarvested.tx);
    //CHECK IF  Harvested EVENT WAS EMITTED
    // Watch the emitted event Harvested()
    const events = await supplyChainInstance.getPastEvents("Harvested", {
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    // Ensure that at least one Harvested event was emitted
    assert.equal(events.length, 1, "Harvested event should be emitted");

    // Mark an item as Processed by calling function processItem()
    const txProcessed = await supplyChainInstance.processItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt2 = await web3.eth.getTransactionReceipt(txProcessed.tx);
    //CHECK IF  Processed EVENT WAS EMITTED
    // Watch the emitted event Processed()
    const events2 = await supplyChainInstance.getPastEvents("Processed", {
      fromBlock: receipt2.blockNumber,
      toBlock: receipt2.blockNumber,
    });

    // Ensure that at least one Processed event was emitted
    assert.equal(events2.length, 1, "Processed event should be emitted");

    // Mark an item as Packed by calling function packItem()
    const txPacked = await supplyChainInstance.packItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt3 = await web3.eth.getTransactionReceipt(txPacked.tx);
    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events3 = await supplyChainInstance.getPastEvents("Packed", {
      fromBlock: receipt3.blockNumber,
      toBlock: receipt3.blockNumber,
    });

    // Ensure that at least one Packed event was emitted
    assert.equal(events3.length, 1, "Packed event should be emitted");

    const price = web3.utils.toWei("0.00007", "ether");

    // Mark an item as ForSale by calling function sellItem()
    const txForSale = await supplyChainInstance.sellItem(upc, price, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt4 = await web3.eth.getTransactionReceipt(txForSale.tx);

    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events4 = await supplyChainInstance.getPastEvents("ForSale", {
      fromBlock: receipt4.blockNumber,
      toBlock: receipt4.blockNumber,
    });
    // Ensure that at least one ForSale event was emitted
    assert.equal(events4.length, 1, "ForSale event should be emitted");

    const amount = web3.utils.toWei("0.00008", "ether");

    //fetch the item
    const resultBufferTwo2 = await supplyChainInstance.fetchItemBufferTwo.call(
      upc
    );

    //getting product price
    const productPrice = resultBufferTwo2[4].toNumber();
    const balance = amount - productPrice;
    assert(
      amount >= productPrice,
      "Amount should be greater or equal product price"
    );

    //buy the item
    const txBuyItem = await supplyChainInstance.buyItem(upc, {
      from: distributorID,
      value: productPrice,
    });

    //send balance to the distributor i.e the change
    await web3.eth.sendTransaction({
      from: distributorID,
      to: distributorID,
      value: balance,
    });

    // Get the transaction receipt to access the emitted events
    const receipt5 = await web3.eth.getTransactionReceipt(txBuyItem.tx);
    //checked if Sold event was emitted
    // Watch the emitted event Sold()
    const events5 = await supplyChainInstance.getPastEvents("Sold", {
      fromBlock: receipt5.blockNumber,
      toBlock: receipt5.blockNumber,
    });

    // Ensure that at least one Sold event was emitted
    assert.equal(events5.length, 1, "Sold event should be emitted");

    // Mark an item as Shipped by calling function shipItem()
    const txShipped = await supplyChainInstance.shipItem(upc, {
      from: distributorID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt6 = await web3.eth.getTransactionReceipt(txShipped.tx);
    //checked if Sold event was emitted
    // Watch the emitted event Sold()
    const events6 = await supplyChainInstance.getPastEvents("Shipped", {
      fromBlock: receipt6.blockNumber,
      toBlock: receipt6.blockNumber,
    });

    // Ensure that at least one Shipped event was emitted
    assert.equal(events6.length, 1, "Shipped event should be emitted");

    //fetch the item
    const resultBufferTwo2AfterSold =
      await supplyChainInstance.fetchItemBufferTwo.call(upc);

    const itemState = resultBufferTwo2AfterSold[5].toNumber();
    // Verify the result set
    assert.equal(itemState, 5, "Item should be in Shipped state that is 5");
  });

  // // 7th Test
  it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async () => {
    //create retailer
    await supplyChainInstance.addRetailer(retailerID, { from: ownerID });

    // Mark an item as Harvested by calling function harvestItem()
    const txHarvested = await supplyChainInstance.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      { from: originFarmerID }
    );

    // Get the transaction receipt to access the emitted events
    const receipt = await web3.eth.getTransactionReceipt(txHarvested.tx);
    //CHECK IF  Harvested EVENT WAS EMITTED
    // Watch the emitted event Harvested()
    const events = await supplyChainInstance.getPastEvents("Harvested", {
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    // Ensure that at least one Harvested event was emitted
    assert.equal(events.length, 1, "Harvested event should be emitted");

    // Mark an item as Processed by calling function processItem()
    const txProcessed = await supplyChainInstance.processItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt2 = await web3.eth.getTransactionReceipt(txProcessed.tx);
    //CHECK IF  Processed EVENT WAS EMITTED
    // Watch the emitted event Processed()
    const events2 = await supplyChainInstance.getPastEvents("Processed", {
      fromBlock: receipt2.blockNumber,
      toBlock: receipt2.blockNumber,
    });

    // Ensure that at least one Processed event was emitted
    assert.equal(events2.length, 1, "Processed event should be emitted");

    // Mark an item as Packed by calling function packItem()
    const txPacked = await supplyChainInstance.packItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt3 = await web3.eth.getTransactionReceipt(txPacked.tx);
    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events3 = await supplyChainInstance.getPastEvents("Packed", {
      fromBlock: receipt3.blockNumber,
      toBlock: receipt3.blockNumber,
    });

    // Ensure that at least one Packed event was emitted
    assert.equal(events3.length, 1, "Packed event should be emitted");

    const price = web3.utils.toWei("0.00007", "ether");

    // Mark an item as ForSale by calling function sellItem()
    const txForSale = await supplyChainInstance.sellItem(upc, price, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt4 = await web3.eth.getTransactionReceipt(txForSale.tx);

    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events4 = await supplyChainInstance.getPastEvents("ForSale", {
      fromBlock: receipt4.blockNumber,
      toBlock: receipt4.blockNumber,
    });
    // Ensure that at least one ForSale event was emitted
    assert.equal(events4.length, 1, "ForSale event should be emitted");

    const amount = web3.utils.toWei("0.00008", "ether");

    //fetch the item
    const resultBufferTwo2 = await supplyChainInstance.fetchItemBufferTwo.call(
      upc
    );

    //getting product price
    const productPrice = resultBufferTwo2[4].toNumber();
    const balance = amount - productPrice;
    assert(
      amount >= productPrice,
      "Amount should be greater or equal product price"
    );

    //buy the item
    const txBuyItem = await supplyChainInstance.buyItem(upc, {
      from: distributorID,
      value: productPrice,
    });

    //send balance to the distributor i.e the change
    await web3.eth.sendTransaction({
      from: distributorID,
      to: distributorID,
      value: balance,
    });

    // Get the transaction receipt to access the emitted events
    const receipt5 = await web3.eth.getTransactionReceipt(txBuyItem.tx);
    //checked if Sold event was emitted
    // Watch the emitted event Sold()
    const events5 = await supplyChainInstance.getPastEvents("Sold", {
      fromBlock: receipt5.blockNumber,
      toBlock: receipt5.blockNumber,
    });

    // Ensure that at least one Sold event was emitted
    assert.equal(events5.length, 1, "Sold event should be emitted");

    // Mark an item as Shipped by calling function shipItem()
    const txShipped = await supplyChainInstance.shipItem(upc, {
      from: distributorID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt6 = await web3.eth.getTransactionReceipt(txShipped.tx);
    //checked if Sold event was emitted
    // Watch the emitted event Sold()
    const events6 = await supplyChainInstance.getPastEvents("Shipped", {
      fromBlock: receipt6.blockNumber,
      toBlock: receipt6.blockNumber,
    });

    // Ensure that at least one Shipped event was emitted
    assert.equal(events6.length, 1, "Shipped event should be emitted");

    // Mark an item as Received by calling function receiveItem()
    const txReceived = await supplyChainInstance.receiveItem(upc, {
      from: retailerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt7 = await web3.eth.getTransactionReceipt(txReceived.tx);
    //checked if Sold event was emitted
    // Watch the emitted event Sold()
    const events7 = await supplyChainInstance.getPastEvents("Received", {
      fromBlock: receipt7.blockNumber,
      toBlock: receipt7.blockNumber,
    });

    // Ensure that at least one Received event was emitted
    assert.equal(events7.length, 1, "Received event should be emitted");

    //fetch the item
    const resultBufferTwo2AfterSold =
      await supplyChainInstance.fetchItemBufferTwo.call(upc);

    const resultBufferOneAfterSold =
      await supplyChainInstance.fetchItemBufferOne.call(upc);

    const newOwnerId = resultBufferOneAfterSold[2]; // new owner is the retailer
    const newRetailerId = resultBufferTwo2AfterSold[7]; // new retailer is the retailer
    const itemState = resultBufferTwo2AfterSold[5].toNumber(); //item state is 6
    console.log(itemState, "itemState");

    // Verify the result set
    assert.equal(newOwnerId, retailerID, "New owner should be the retailer");

    assert.equal(
      newRetailerId,
      retailerID,
      "New retailer should be the retailer"
    );

    assert.equal(itemState, 6, "Item should be in Received state that is 6");
  });

  // // 8th Test
  it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async () => {
    //create consumer
    await supplyChainInstance.addConsumer(consumerID, { from: ownerID });

    // Mark an item as Harvested by calling function harvestItem()
    const txHarvested = await supplyChainInstance.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      { from: originFarmerID }
    );

    // Get the transaction receipt to access the emitted events
    const receipt = await web3.eth.getTransactionReceipt(txHarvested.tx);
    //CHECK IF  Harvested EVENT WAS EMITTED
    // Watch the emitted event Harvested()
    const events = await supplyChainInstance.getPastEvents("Harvested", {
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    // Ensure that at least one Harvested event was emitted
    assert.equal(events.length, 1, "Harvested event should be emitted");

    // Mark an item as Processed by calling function processItem()
    const txProcessed = await supplyChainInstance.processItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt2 = await web3.eth.getTransactionReceipt(txProcessed.tx);
    //CHECK IF  Processed EVENT WAS EMITTED
    // Watch the emitted event Processed()
    const events2 = await supplyChainInstance.getPastEvents("Processed", {
      fromBlock: receipt2.blockNumber,
      toBlock: receipt2.blockNumber,
    });

    // Ensure that at least one Processed event was emitted
    assert.equal(events2.length, 1, "Processed event should be emitted");

    // Mark an item as Packed by calling function packItem()
    const txPacked = await supplyChainInstance.packItem(upc, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt3 = await web3.eth.getTransactionReceipt(txPacked.tx);
    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events3 = await supplyChainInstance.getPastEvents("Packed", {
      fromBlock: receipt3.blockNumber,
      toBlock: receipt3.blockNumber,
    });

    // Ensure that at least one Packed event was emitted
    assert.equal(events3.length, 1, "Packed event should be emitted");

    const price = web3.utils.toWei("0.00007", "ether");

    // Mark an item as ForSale by calling function sellItem()
    const txForSale = await supplyChainInstance.sellItem(upc, price, {
      from: originFarmerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt4 = await web3.eth.getTransactionReceipt(txForSale.tx);

    //CHECK IF  Packed EVENT WAS EMITTED
    // Watch the emitted event Packed()
    const events4 = await supplyChainInstance.getPastEvents("ForSale", {
      fromBlock: receipt4.blockNumber,
      toBlock: receipt4.blockNumber,
    });
    // Ensure that at least one ForSale event was emitted
    assert.equal(events4.length, 1, "ForSale event should be emitted");

    const amount = web3.utils.toWei("0.00008", "ether");

    //fetch the item
    const resultBufferTwo2 = await supplyChainInstance.fetchItemBufferTwo.call(
      upc
    );

    //getting product price
    const productPrice = resultBufferTwo2[4].toNumber();
    const balance = amount - productPrice;
    assert(
      amount >= productPrice,
      "Amount should be greater or equal product price"
    );

    //buy the item
    const txBuyItem = await supplyChainInstance.buyItem(upc, {
      from: distributorID,
      value: productPrice,
    });

    //send balance to the distributor i.e the change
    await web3.eth.sendTransaction({
      from: distributorID,
      to: distributorID,
      value: balance,
    });

    // Get the transaction receipt to access the emitted events
    const receipt5 = await web3.eth.getTransactionReceipt(txBuyItem.tx);
    //checked if Sold event was emitted
    // Watch the emitted event Sold()
    const events5 = await supplyChainInstance.getPastEvents("Sold", {
      fromBlock: receipt5.blockNumber,
      toBlock: receipt5.blockNumber,
    });

    // Ensure that at least one Sold event was emitted
    assert.equal(events5.length, 1, "Sold event should be emitted");

    // Mark an item as Shipped by calling function shipItem()
    const txShipped = await supplyChainInstance.shipItem(upc, {
      from: distributorID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt6 = await web3.eth.getTransactionReceipt(txShipped.tx);
    //checked if Sold event was emitted
    // Watch the emitted event Sold()
    const events6 = await supplyChainInstance.getPastEvents("Shipped", {
      fromBlock: receipt6.blockNumber,
      toBlock: receipt6.blockNumber,
    });

    // Ensure that at least one Shipped event was emitted
    assert.equal(events6.length, 1, "Shipped event should be emitted");

    // Mark an item as Received by calling function receiveItem()
    const txReceived = await supplyChainInstance.receiveItem(upc, {
      from: retailerID,
    });

    // Get the transaction receipt to access the emitted events
    const receipt7 = await web3.eth.getTransactionReceipt(txReceived.tx);
    //checked if Sold event was emitted
    // Watch the emitted event Sold()
    const events7 = await supplyChainInstance.getPastEvents("Received", {
      fromBlock: receipt7.blockNumber,
      toBlock: receipt7.blockNumber,
    });

    // Ensure that at least one Received event was emitted
    assert.equal(events7.length, 1, "Received event should be emitted");

    //fetch the item
    const resultBufferTwo2BeforePurchase =
      await supplyChainInstance.fetchItemBufferTwo.call(upc);

    const amountToTender = web3.utils.toWei("0.00009", "ether");

    //getting product price
    const salePrice = resultBufferTwo2[4].toNumber();
    const change = amount - salePrice;
    assert(
      amountToTender >= salePrice,
      "Amount should be greater or equal to cost of goods"
    );

    //purchase the item
    const txPurchase = await supplyChainInstance.purchaseItem(upc, {
      from: consumerID,
      value: salePrice,
    });

    //send balance to the distributor i.e the change
    await web3.eth.sendTransaction({
      from: consumerID,
      to: consumerID,
      value: change,
    });

    // Get the transaction receipt to access the emitted events
    const receipt8 = await web3.eth.getTransactionReceipt(txPurchase.tx);
    //checked if Purchased event was emitted
    // Watch the emitted event Purchased()
    const events8 = await supplyChainInstance.getPastEvents("Purchased", {
      fromBlock: receipt8.blockNumber,
      toBlock: receipt8.blockNumber,
    });

    // Ensure that at least one Purchased event was emitted
    assert.equal(events8.length, 1, "Purchased event should be emitted");

    //fetch the item
    const resultBufferTwo2AfterPurchase =
      await supplyChainInstance.fetchItemBufferTwo.call(upc);

    const resultBufferOneAfterPurchase =
      await supplyChainInstance.fetchItemBufferOne.call(upc);

    const newOwnerId = resultBufferOneAfterPurchase[2]; // new owner is the consumer
    const newConsumerId = resultBufferTwo2AfterPurchase[8]; // new consumer is the consumer
    const itemState = resultBufferTwo2AfterPurchase[5].toNumber(); //item state is 7
    console.log(itemState, "itemState");
    // Verify the result set
    assert.equal(newOwnerId, consumerID, "New owner should be the consumer");

    assert.equal(
      newConsumerId,
      consumerID,
      "New consumer should be the consumer"
    );

    assert.equal(itemState, 7, "Item should be in Purchased state that is 7");
  });

  // // 9th Test
  it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async () => {
    const resultBufferOne = await supplyChainInstance.fetchItemBufferOne(upc, {
      from: consumerID,
    });

    assert.equal(9, resultBufferOne[0].toNumber(), "Error: Invalid item SKU");
    assert.equal(upc, resultBufferOne[1].toNumber(), "Error: Invalid item UPC");
    assert.equal(consumerID, resultBufferOne[2], "Error: Invalid ownerID"); //emptyAddress
    assert.equal(
      originFarmerID,
      resultBufferOne[3],
      "Error: Invalid originFarmerID"
    );
    assert.equal(
      originFarmName,
      resultBufferOne[4],
      "Error: Invalid originFarmName"
    );
    assert.equal(
      originFarmInformation,
      resultBufferOne[5],
      "Error: Invalid originFarmInformation"
    );
    assert.equal(
      originFarmLatitude,
      resultBufferOne[6],
      "Error: Invalid originFarmLatitude"
    );
    assert.equal(
      originFarmLongitude,
      resultBufferOne[7],
      "Error: Invalid originFarmLongitude"
    );
  });

  // // 10th Test
  it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async () => {
    // Retrieve the just now saved item from blockchain by calling function fetchItem()

    const resultBufferTwo = await supplyChainInstance.fetchItemBufferTwo(upc, {
      from: consumerID,
    });

    // Verify the result set:

    assert.equal(9, resultBufferTwo[0].toNumber(), "Error: Invalid item SKU");
    assert.equal(upc, resultBufferTwo[1].toNumber(), "Error: Invalid item UPC");
    assert.equal(10, resultBufferTwo[2].toNumber(), "Error: Invalid productID");
    assert.equal(
      "Best beans for Espresso",
      resultBufferTwo[3],
      "Error: Invalid productNotes"
    );
    assert.equal(
      web3.utils.toWei("0.00007", "ether"),
      resultBufferTwo[4].toNumber(),
      "Error: Invalid productPrice"
    );
    assert.equal(7, resultBufferTwo[5].toNumber(), "Error: Invalid itemState");
    assert.equal(
      distributorID,
      resultBufferTwo[6],
      "Error: Invalid distributorID"
    );
    assert.equal(retailerID, resultBufferTwo[7], "Error: Invalid retailerID");
    assert.equal(consumerID, resultBufferTwo[8], "Error: Invalid consumerID");
  });
});

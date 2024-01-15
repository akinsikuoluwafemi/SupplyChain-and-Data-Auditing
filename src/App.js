import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import ownableArtifact from "./truffle/build/contracts/Ownable.json";
import "./style.css";

const App = () => {
  const [sku, setSku] = useState("");
  const [upc, setUpc] = useState(1);
  const [ownerID, setOwnerID] = useState("");
  const [farmName, setFarmName] = useState("");
  const [farmerId, setFarmerId] = useState("");
  const [farmInformation, setFarmInformation] = useState("");
  const [farmLatitude, setFarmLatitude] = useState("");
  const [farmLongitude, setFarmLongitude] = useState("");
  const [productNotes, setProductNotes] = useState("");
  const [productPrice, setProductPrice] = useState(0);

  const [newFarmerId, setNewFarmerId] = useState("");
  const [newDistributorId, setNewDistributorId] = useState("");
  const [newRetailerId, setNewRetailerId] = useState("");
  const [newConsumerId, setNewConsumerId] = useState("");

  // web3 states
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);

  const addSepoliaContract = "0x074F9241b60987926C7Cafb6CBE6f7444827fB38";

  // all events;
  const [allEvents, setAllEvents] = useState([]);

  const [BufferOne, setBufferOne] = useState({
    sku: 0,
    upc: 0,
    ownerID: 0,
    originFarmerID: 0,
    originFarmName: "",
    originFarmInformation: "",
    originFarmLatitude: "",
    originFarmLongitude: "",
    productNotes: "",
  });
  const [BufferTwo, setBufferTwo] = useState({
    sku: 0,
    upc: 0,
    productID: 0,
    productNotes: "",
    productPrice: 0,
    itemState: 0,
    distributorID: 0,
    retailerID: 0,
    consumerID: 0,
  });

  const itemStates = {
    0: "Harvested",
    1: "Processed",
    2: "Packed",
    3: "ForSale",
    4: "Sold",
    5: "Shipped",
    6: "Received",
    7: "Purchased",
  };

  const initWeb3 = async () => {
    if (window.ethereum || window.web3) {
      // Use the injected provider (e.g., MetaMask)
      const _web3 = new Web3(window.ethereum || window.web3.currentProvider);
      const _contract = new _web3.eth.Contract(
        ownableArtifact.abi,
        addSepoliaContract
      );
      setWeb3(_web3);
      setContract(_contract);
      try {
        // Request account access if needed
        await window.eth_requestAccounts;
        const account = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setCurrentAccount(account[0]);
      } catch (err) {
        console.error(err);
        console.log("User denied account access");
      }
    } else {
      console.log(
        "No web3 detected. Install MetaMask or use a web3-enabled browser."
      );
    }
  };

  const connectWallet = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      // From now on, this should always be true:
      provider === window.ethereum;
      console.log("Ethereum successfully detected!");
    } else {
      console.error("Please install MetaMask!");
    }
  };

  // Function to handle account changes
  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      const newAccount = accounts[0];
      setCurrentAccount(newAccount);
      // Do something with the new account if needed
      console.log("Connected account changed:", newAccount);
    } else {
      // Handle the case when no account is connected
      setCurrentAccount("");
      console.log("No account connected");
    }
  };

  useEffect(() => {
    initWeb3();
    connectWallet();
    // Event listener for account changes
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    // Clean up the event listener when the component unmounts
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [currentAccount]);

  // any admin can do all this
  const addNewFarmer = async () => {
    try {
      const newFarmerTx = await contract.methods
        .addFarmer(newFarmerId)
        .send({ from: currentAccount });

      await checkForEvents(newFarmerTx, "FarmerAdded");
      setNewFarmerId(newFarmerId);
      alert("New Farmer Added");
    } catch (err) {
      console.log(err);
    }
  };

  // any admin can do all this
  const addNewDistributor = async () => {
    try {
      const newDistributorTx = await contract.methods
        .addDistributor(newDistributorId)
        .send({
          from: currentAccount,
        });
      await checkForEvents(newDistributorTx, "DistributorAdded");
      setNewDistributorId(newDistributorId);
      alert("New Distributor Added");
    } catch (err) {
      console.log(err);
    }
  };

  // any admin can do all this
  const addNewRetailer = async () => {
    try {
      const newRetailerTx = await contract.methods
        .addRetailer(newRetailerId)
        .send({
          from: currentAccount,
        });
      await checkForEvents(newRetailerTx, "RetailerAdded");
      setNewRetailerId(newRetailerId);
      alert("New Retailer Added");
    } catch (err) {
      console.log(err);
    }
  };

  // any admin can do all this
  const addNewConsumer = async () => {
    try {
      const newConsumerTx = await contract.methods
        .addConsumer(newConsumerId)
        .send({
          from: currentAccount,
        });
      await checkForEvents(newConsumerTx, "ConsumerAdded");
      setNewConsumerId(newConsumerId);
      alert("New Consumer Added");
    } catch (err) {
      console.log(err);
    }
  };

  //check for events
  const checkForEvents = async (tx, eventName) => {
    try {
      const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
      await contract.getPastEvents(eventName, {
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });
      setAllEvents([
        {
          name: eventName,
          blockNumber: receipt.blockNumber,
          from: receipt.from,
        },
        ...allEvents,
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  // for farmers
  const HarvestItem = async () => {
    try {
      //check if this call is from farmer
      const isThisAFarmer = await contract.methods
        .isFarmer(currentAccount)
        .call({ from: currentAccount });

      if (isThisAFarmer === true) {
        const data = {
          upc,
          farmerId,
          farmName,
          farmInformation,
          farmLatitude,
          farmLongitude,
          productNotes,
        };

        const harvestTx = await contract.methods
          .harvestItem(
            data.upc,
            data.farmerId,
            data.farmName,
            data.farmInformation,
            data.farmLatitude,
            data.farmLongitude,
            data.productNotes
          )
          .send({ from: currentAccount });
        await checkForEvents(harvestTx, "Harvested");
        alert("New Item Harvested");
      } else {
        alert("Only Farmers can harvest");
      }
    } catch (err) {
      console.log(err);
    }
  };
  // for farmers
  const ProcessItem = async () => {
    try {
      //check if this call is from farmer
      const isThisAFarmer = await contract.methods
        .isFarmer(currentAccount)
        .call({ from: currentAccount });

      console.log({ isThisAFarmer });

      if (isThisAFarmer === true) {
        const processTx = await contract.methods
          .processItem(upc)
          .send({ from: currentAccount });
        await checkForEvents(processTx, "Processed");
        alert("Item Processed");
      } else {
        alert("Only Farmers can process");
      }
    } catch (err) {
      console.log(err);
    }
  };
  // for farmers
  const PackItem = async () => {
    try {
      //check if this call is from farmer
      const isThisAFarmer = await contract.methods
        .isFarmer(currentAccount)
        .call({ from: currentAccount });

      if (isThisAFarmer === true) {
        const packTx = await contract.methods
          .packItem(upc)
          .send({ from: currentAccount });
        await checkForEvents(packTx, "Packed");
        alert("Item Packed");
      } else {
        alert("Only Farmers can pack");
      }
    } catch (err) {
      console.log(err);
    }
  };
  // for farmers
  const PutItemForSale = async () => {
    console.log({ productPrice, upc });
    try {
      //check if this call is from farmer
      const isThisAFarmer = await contract.methods
        .isFarmer(currentAccount)
        .call({ from: currentAccount });

      if (isThisAFarmer === true) {
        const putForSaleTx = await contract.methods
          .sellItem(upc, web3.utils.toWei(productPrice, "ether"))
          .send({ from: currentAccount });
        await checkForEvents(putForSaleTx, "ForSale");
        alert("Item put for sale");
      } else {
        alert("Only Farmers can put item for sale");
      }
    } catch (err) {
      console.log(err.message);
    }
  };

  // for distributors
  const BuyItem = async () => {
    const isThisADistributor = await contract.methods
      .isDistributor(currentAccount)
      .call({ from: currentAccount });

    if (isThisADistributor === true) {
      const buyTx = await contract.methods.buyItem(upc).send({
        from: currentAccount,
        value: web3.utils.toWei(productPrice, "ether"),
      });
      await checkForEvents(buyTx, "Sold");
      alert("Item Bought");
    } else {
      alert("Only Distributors can buy");
    }
  };

  // for distributors
  const ShipItem = async () => {
    const isThisADistributor = await contract.methods
      .isDistributor(currentAccount)
      .call({ from: currentAccount });

    if (isThisADistributor === true) {
      const shipTx = await contract.methods
        .shipItem(upc)
        .send({ from: currentAccount });
      await checkForEvents(shipTx, "Shipped");
      alert("Item Shipped");
    } else {
      alert("Only Distributors can ship");
    }
  };

  //for retailer
  const ReceiveItem = async () => {
    const isThisARetailer = await contract.methods
      .isRetailer(currentAccount)
      .call({ from: currentAccount });

    if (isThisARetailer === true) {
      const receiveTx = await contract.methods
        .receiveItem(upc)
        .send({ from: currentAccount });
      await checkForEvents(receiveTx, "Received");
      alert("Item Received");
    } else {
      alert("Only Retailers can receive");
    }
  };

  //for consumer
  const PurchaseItem = async () => {
    const isThisAConsumer = await contract.methods
      .isConsumer(currentAccount)
      .call({ from: currentAccount });

    if (isThisAConsumer === true) {
      const purchaseTx = await contract.methods.purchaseItem(upc).send({
        from: currentAccount,
        value: web3.utils.toWei(productPrice, "ether"),
      });
      await checkForEvents(purchaseTx, "Purchased");
      alert("Item Purchased");
    } else {
      alert("Only Consumers can purchase");
    }
  };

  const formatAdd = (add) => {
    return add.slice(0, 6) + "..." + add.slice(-4);
  };

  // for all
  const fetchItemBufferOne = async () => {
    try {
      const bufferOne = await contract.methods
        .fetchItemBufferOne(upc)
        .call({ from: currentAccount });

      setBufferOne({
        sku: parseInt(bufferOne[0], 10),
        upc: parseInt(bufferOne[1], 10),
        ownerID: formatAdd(bufferOne[2]),
        originFarmerID: formatAdd(bufferOne[3]),
        originFarmName: bufferOne[4],
        originFarmInformation: bufferOne[5],
        originFarmLatitude: bufferOne[6],
        originFarmLongitude: bufferOne[7],
      });
    } catch (err) {
      console.log(err);
    }
  };

  const fetchItemBufferTwo = async () => {
    try {
      const bufferTwo = await contract.methods
        .fetchItemBufferTwo(upc)
        .call({ from: currentAccount });

      setBufferTwo({
        sku: parseInt(bufferTwo[0], 10),
        upc: parseInt(bufferTwo[1], 10),
        productID: parseInt(bufferTwo[2], 10),
        productNotes: bufferTwo[3],
        productPrice: parseInt(bufferTwo[4], 10),
        itemState: itemStates[parseInt(bufferTwo[5], 10)],
        distributorID: formatAdd(bufferTwo[6]),
        retailerID: formatAdd(bufferTwo[7]),
        consumerID: formatAdd(bufferTwo[8]),
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="container">
        <h1 style={{ textAlign: "center" }}>Fair Trade Coffee</h1>
        <hr />

        <p style={{ textAlign: "center" }}>
          Prove the authenticity of coffee using the Ethereum blockchain.
        </p>
      </div>
      <div className="flex">
        <div className="container">
          <div>
            <h2>Product Overview</h2>
            <div className="form-group">
              <br />
              <label htmlFor="upc">UPC</label>
              <br />
              <input
                className="input-field"
                type="number"
                id="upc"
                onChange={(e) => setUpc(e.target.value)}
                name="upc"
                value={upc}
              />

              <br />
              <div className="button-div">
                <button onClick={fetchItemBufferOne} id="button" type="button">
                  Fetch Data 1
                </button>
                <button onClick={fetchItemBufferTwo} id="button" type="button">
                  Fetch Data 2
                </button>
              </div>
            </div>
            <div className="form-break"></div>
            <h2>Farm Details</h2>
            <div className="form-group">
              <label htmlFor="farmerId">Farmer ID</label>
              <br />
              <input
                type="text"
                name="farmerId"
                className="input"
                id="farmerId"
                onChange={(e) => setFarmerId(e.target.value)}
                value={farmerId}
              />
              <br />
              <label htmlFor="originFarmName">Farm Name</label>
              <br />
              <input
                id="originFarmName"
                name="originFarmName"
                className="input"
                onChange={(e) => setFarmName(e.target.value)}
                value={farmName}
              />
              <br />
              <label htmlFor="originFarmInformation">Farm Information</label>
              <br />
              <input
                id="originFarmInformation"
                name="originFarmInformation"
                className="input"
                onChange={(e) => setFarmInformation(e.target.value)}
                value={farmInformation}
              />
              <br />
              <label htmlFor="originFarmLatitude">Farm Latitude</label>
              <br />
              <input
                id="originFarmLatitude"
                name="originFarmLatitude"
                className="input"
                onChange={(e) => setFarmLatitude(e.target.value)}
                value={farmLatitude}
              />
              <br />
              <label htmlFor="originFarmLongitude">Farm Longitude</label>
              <br />
              <input
                id="originFarmLongitude"
                name="originFarmLongitude"
                className="input"
                onChange={(e) => setFarmLongitude(e.target.value)}
                value={farmLongitude}
              />
              <br />
              <br />

              <button
                onClick={HarvestItem}
                id="button"
                type="button"
                data-id="1"
              >
                Harvest
              </button>
              <button
                onClick={ProcessItem}
                id="button"
                type="button"
                data-id="2"
              >
                Process
              </button>
              <button onClick={PackItem} id="button" type="button" data-id="3">
                Pack
              </button>
              <button
                onClick={PutItemForSale}
                id="button"
                type="button"
                data-id="4"
              >
                ForSale
              </button>
            </div>
            <div className="form-break"></div>
            <h2>Product Details</h2>
            <div className="form-group">
              <label htmlFor="productNotes">Product Notes</label>
              <br />
              <input
                id="productNotes"
                name="productNotes"
                className="input"
                onChange={(e) => setProductNotes(e.target.value)}
                value={productNotes}
              />
              <br />
              <label htmlFor="productPrice">Product Price</label>
              <br />
              <input
                id="productPrice"
                name="productPrice"
                className="input"
                onChange={(e) => setProductPrice(e.target.value)}
                value={productPrice}
              />
              &nbsp; ETH
              <br />
              <br />
              <br />
              <button onClick={BuyItem} id="button" type="button" data-id="5">
                Buy
              </button>
              <button onClick={ShipItem} id="button" type="button" data-id="6">
                Ship
              </button>
              <button
                onClick={ReceiveItem}
                id="button"
                type="button"
                data-id="7"
              >
                Receive
              </button>
              <button
                onClick={PurchaseItem}
                id="button"
                type="button"
                data-id="8"
              >
                Purchase
              </button>
            </div>
            <div className="form-break"></div>
          </div>
        </div>
        <div className="right">
          <h2>Add Farmer</h2>
          <div className="form-group">
            <label htmlFor="newFarmerId">Add Farmer</label>
            <br />
            <input
              id="newFarmerId"
              name="newFarmerId"
              className="input"
              onChange={(e) => setNewFarmerId(e.target.value)}
              value={newFarmerId}
            />
            <br />
            <button onClick={addNewFarmer} id="button" type="button">
              Add Farmer
            </button>
            <br />
            <br />

            <label htmlFor="newFarmerId">Add Distributor</label>
            <input
              id="newDistributorId"
              name="newDistributorId"
              className="input"
              onChange={(e) => setNewDistributorId(e.target.value)}
              value={newDistributorId}
            />
            <br />
            <button onClick={addNewDistributor} id="button" type="button">
              Add Distributor
            </button>
            <br />
            <br />

            <label htmlFor="newRetailerId">Add Retailer</label>
            <input
              id="newRetailerId"
              name="newRetailerId"
              className="input"
              onChange={(e) => setNewRetailerId(e.target.value)}
              value={newRetailerId}
            />
            <br />
            <button onClick={addNewRetailer} id="button" type="button">
              Add Retailer
            </button>

            <br />
            <br />

            <label htmlFor="newFarmerId">Add Consumer</label>
            <input
              id="newConsumerId"
              name="newConsumerId"
              className="input"
              onChange={(e) => setNewConsumerId(e.target.value)}
              value={newConsumerId}
            />
            <br />
            <button onClick={addNewConsumer} id="button" type="button">
              Add Consumer
            </button>
          </div>
          {/* BufferOne info */}
          <h2>Item Buffer One Info</h2>

          <div className="info form-group">
            <p className="info-data">
              SKU: &nbsp;
              <span>{BufferOne.sku}</span>
            </p>
            <p className="info-data">
              UPC: &nbsp;
              <span>{BufferOne.upc}</span>
            </p>
            <p className="info-data">
              OwnerID: &nbsp;
              <span>{BufferOne.ownerID}</span>
            </p>
            <p className="info-data">
              OriginFarmerID: &nbsp;
              <span>{BufferOne.originFarmerID}</span>
            </p>
            <p className="info-data">
              OriginFarmName: &nbsp;
              <span>{BufferOne.originFarmName}</span>
            </p>
            <p className="info-data">
              OriginFarmInformation: &nbsp;
              <span>{BufferOne.originFarmInformation}</span>
            </p>
            <p className="info-data">
              OriginFarmLatitude: &nbsp;
              <span>{BufferOne.originFarmLatitude}</span>
            </p>
            <p className="info-data">
              OriginFarmLongitude: &nbsp;
              <span>{BufferOne.originFarmLongitude}</span>
            </p>
          </div>

          {/* BufferOne info */}
          <h2>Item Bufffer Two Info</h2>

          <div className="info form-group">
            <p className="info-data">
              SKU: &nbsp;
              <span>{BufferTwo.sku}</span>
            </p>
            <p className="info-data">
              UPC: &nbsp;
              <span>{BufferTwo.upc}</span>
            </p>
            <p className="info-data">
              ProductID: &nbsp;
              <span>{BufferTwo.productID}</span>
            </p>
            <p className="info-data">
              ProductNotes: &nbsp;
              <span>{BufferTwo.productNotes}</span>
            </p>
            <p className="info-data">
              ProductPrice: &nbsp;
              <span>{BufferTwo.productPrice / Math.pow(10, 18)} ETH</span>
            </p>
            <p className="info-data">
              ItemState: &nbsp;
              <span>{BufferTwo.itemState}</span>
            </p>
            <p className="info-data">
              DistributorID: &nbsp;
              <span>{BufferTwo.distributorID}</span>
            </p>
            <p className="info-data">
              RetailerID: &nbsp;
              <span>{BufferTwo.retailerID}</span>
            </p>
            <p className="info-data">
              ConsumerID: &nbsp;
              <span>{BufferTwo.consumerID}</span>
            </p>
          </div>
        </div>
      </div>
      <hr />

      <h2>
        Transaction History<span id="ftc-history"></span>
      </h2>
      <ul id="ftc-events">
        Events will appear here when you interact with the contract.
        {allEvents &&
          allEvents.slice(0, 6).map((event) => (
            <li key={event.blockNumber}>
              <small>{event.name}</small> events with Block Number:
              {parseInt(event.blockNumber, 10)}
              <small>{event.blockNumber}</small> just fired now from address:{" "}
              <small>{formatAdd(event.from)}</small>
            </li>
          ))}
      </ul>
      <br />
      <hr />
    </>
  );
};

export default App;

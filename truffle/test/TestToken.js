let DCurator = artifacts.require('../DCurator.sol');

contract('DCurator', function (accounts) {
	let token;
	beforeEach(async function () {
		token = await DCurator.new();
	});

	
	it('should start with 10000 tokens', async function() {
		let currentSuply = await token.getCurrentTokens();
		assert.equal(currentSuply, 10000);
	});
	
	it('supply is 10000', async function() {
		let currentSuply = await token.getSupply();
		assert.equal(currentSuply, 10000);
	});

	it('supply is 10000', async function() {
		let currentSuply = await token.getTokenAmmount(accounts[0]);
		assert.equal(currentSuply, 10000);
	});
	
	it('request tokens gives correct ammount', async function() {
		let request = await token.requestTokens(100,{from:accounts[1]});
		let newSupply = await token.getTokenAmmount(accounts[1]);
		let currentSuply = await token.getTokenAmmount(accounts[0]);
		assert.equal(newSupply, 100);
		assert.equal(currentSuply, 9900);
	});
	
	it('request of 0 tokens is not possible', async function() {
		try {
			let request = await token.requestTokens(0,{from:accounts[1]});
		} catch(error) {
			assert.ok(/revert/.test(error.message));
		}
		let newSupply = await token.getTokenAmmount(accounts[1]);
		let currentSuply = await token.getTokenAmmount(accounts[0]);
		assert.equal(newSupply, 0);
		assert.equal(currentSuply, 10000);
	});

	it('request of more than 10000 tokens is not possible', async function() {
		try {
			let request = await token.requestTokens(100001,{from:accounts[1]});
		} catch(error) {
			assert.ok(/revert/.test(error.message));
		}
		let newSupply = await token.getTokenAmmount(accounts[1]);
		let currentSuply = await token.getTokenAmmount(accounts[0]);
		assert.equal(newSupply, 0);
		assert.equal(currentSuply, 10000);
	});
	
	it('transfer of tokens is successfull', async function() {
		let request = await token.transfer(accounts[1],100);
		let newSupply = await token.getTokenAmmount(accounts[1]);
		let currentSuply = await token.getTokenAmmount(accounts[0]);
		assert.equal(newSupply, 100);
		assert.equal(currentSuply, 9900);
	});
	
	it('transfer of 0 tokens is not possible', async function() {
		try {
		let request = await token.transfer(accounts[1],0);
		} catch(error) {
			assert.ok(/revert/.test(error.message));
		}
		let newSupply = await token.getTokenAmmount(accounts[1]);
		let currentSuply = await token.getTokenAmmount(accounts[0]);
		assert.equal(newSupply, 0);
		assert.equal(currentSuply, 10000);
	});
	
	
	it('transfer of tokens from owner with 0 is not possible', async function() {
		try {
		let request = await token.transfer(accounts[0],100, {from:accounts[1]});
		} catch(error) {
			assert.ok(/revert/.test(error.message));
		}
		let newSupply = await token.getTokenAmmount(accounts[1]);
		let currentSuply = await token.getTokenAmmount(accounts[0]);
		assert.equal(newSupply, 0);
		assert.equal(currentSuply, 10000);
	});
	
	it('item is created', async function() {
		let request = await token.createItem("name", "google.com", "Dragomir",
			accounts[0], "");
		let items = await token.getElementCount();
		assert.equal(items, 1);
	});
	
	it('item rank is updated correctly', async function() {
		let request = await token.createItem("name", "google.com", "Dragomir",
			accounts[0], "");
			
		let positiveRank = await token.updateVote(0, true);	 // should be 10;
		let item = await token.getItemById(0);
		assert.equal(item[7].c, 10);
		
		let negativeRank = await token.updateVote(0, false);	// should be 5;
		item = await token.getItemById(0);
		assert.equal(item[7].c, 5);
		
		let anotherPositive = await token.updateVote(0, true);
		item = await token.getItemById(0);
		assert.equal(item[7].c, 6); // should be 6 (,666)
	});
	
	
	it('item views is updated correctly', async function() {
		let request = await token.createItem("name", "google.com", "Dragomir",
			accounts[0], "");
			
		let item = await token.getItemById(0);
		assert.equal(item[5].c, 0);
			
		let updateViews = await token.updateViews(0);	 // should be 10;
		item = await token.getItemById(0);
		assert.equal(item[5].c, 1);
	});
	
	
	it('user items is returned correctly', async function() {
		let request = await token.createItem("name", "google.com", "Dragomir",
			accounts[0], "");
			
		let item = await token.getAllByCuratorName("Dragomir");
		assert.equal(item.length, 1);
		
		item = await token.getAllByCuratorName("Gosho");
		assert.equal(item.length, 0);
	});
	
	it('delete when owner is working', async function() {
		let request = await token.createItem("name", "google.com", "Dragomir",
			accounts[0], "");
			
		let item = await token.getAllByCuratorName("Dragomir");
		assert.equal(item.length, 1);
		
		item = await token.deleteItem(0);
		item = await token.getAllByCuratorName("Dragomir");
		assert.equal(item.length, 0);
	});
	
	
	it('delete when not owner is not working', async function() {
		let request = await token.createItem("name", "google.com", "Dragomir",
			accounts[0], "");
			
		let item = await token.getAllByCuratorName("Dragomir");
		assert.equal(item.length, 1);
		
		try {
		item = await token.deleteItem(0, {from:accounts[1]});
		} catch (error) {
			assert.ok(/revert/.test(error.message));
		}
		item = await token.getAllByCuratorName("Dragomir");
		assert.equal(item.length, 1);
	});
		
});
pragma solidity ^0.4.24;

contract DCurator {
    
    // Token variables
    address creator;
    mapping(address => uint) private tokens;
    
    // Curator items
    struct Item {
        uint id;
        string itemName;
        string itemUrl;
        string curatorName;
        address supportAddress;
        uint views; // views
        uint votes; // count of votes
        uint rank; // this is calculated rank based on views/votes
        uint contentType; // default is 0 which is video
		string ipfsHash;
    }
    
    uint itemId;
    mapping(uint => Item) items;
    
    constructor() public {
        itemId = 0;
        creator = msg.sender;
        tokens[creator] = 10000;
    }
    
    // validate input with 
    // CreateItem -> 1 test
    function createItem(string _itemName, string _itemUrl, string _curatorName,
        address _supportAddress, string _ipfsHash) external returns (uint) {  // TODO add input ipfs image
        uint id = itemId++;
        Item memory it = Item({id:id, itemName:_itemName, itemUrl:_itemUrl, curatorName:_curatorName, supportAddress: _supportAddress, 
        views: 0, votes: 0, rank: 5, contentType:0, ipfsHash: _ipfsHash});
        items[it.id] = it;
        return it.id;
    }
  
    // Update vote -> 2 unit tests
    function updateVote(uint id, bool _vote) external returns(uint256){
        items[id].votes += 1;
        uint delta = items[id].rank / items[id].votes;
        uint256 newRank;
        if(_vote) {
            newRank = items[id].rank + delta;
        } else {
            newRank = items[id].rank - delta;
        }
        items[id].rank = newRank;
		return newRank;
    }
    
    // Return item by id
    function getItemById(uint id) view public returns(uint, string, string, string, address, uint, uint, uint, uint, string) {
        Item memory item = items[id];
        return (id, item.itemName, item.itemUrl, item.curatorName, item.supportAddress, item.views, 
            item.votes, item.rank, item.contentType, item.ipfsHash );
    }
    
    // Update item views
    function updateViews(uint id) external {
        items[id].views += 1;
    }
     
    // getElementCount   
    function getElementCount() public view returns(uint) {
        return itemId;
    }
    
    // delete item restrict to owner
    function deleteItem(uint id) public  {
        require(
            msg.sender == items[id].supportAddress,
            "Only curator can delete it's item."
        );
        delete items[id];
    }
    
    // getAllByCuratorName
    function getAllByCuratorName(string name) public view returns(uint[]) {
        int[] memory curatorItems = new int[](itemId);
        for(uint i=0;i<itemId;i++) {
            curatorItems[i] = -1;
        }
        
        uint j = 0;
        for(i=0;i<itemId;i++) {
            if(keccak256(abi.encodePacked(items[i].curatorName)) == keccak256(abi.encodePacked(name))) {
                curatorItems[i]=1;
                j++;
            }
        }
        
        uint[] memory finalItems = new uint[](j);
        j=0;
        for(i=0; i<itemId; i++) {
            if(curatorItems[i] != -1) {
                finalItems[j++] = i;
            }
        }
        return finalItems;
    }
    
    
    function transfer(address to, uint ammount) external returns (string) {
        require(ammount > 0);
        require(tokens[msg.sender] >= ammount);
		
        tokens[to] += ammount;
        tokens[creator] -= ammount;
    }
    
    function requestTokens(uint ammount) external returns (string) {
        require(ammount > 0);
        require(tokens[creator] >= ammount);
		
		tokens[msg.sender] = tokens[msg.sender] + ammount;
		tokens[creator] = tokens[creator] - ammount; 
    }
    
    function getTokenAmmount(address adr) view external returns(uint) {
        return tokens[adr];
    }
    
    function getSupply() view external returns (uint) 
    {
        return tokens[creator];
    }
    
    function getCurrentTokens() view external returns (uint) 
    {
        return tokens[msg.sender];
    }
}
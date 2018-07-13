var DCurator = artifacts.require("DCurator");

var dc;

module.exports = function(deployer) {
	deployer.deploy(DCurator);
	
	DCurator.deployed().then(function (inst) {
		dc = inst 
	});
}

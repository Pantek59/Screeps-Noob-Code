var roleDistributor = require("role.distributor");

module.exports = {
    // a function to run the logic for this role
    run: function(creep, target) {
    	// Collect energy from different sources
    	var returncode;

    	switch (target) {
			case "droppedEnergy":
    			var source = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
    			returncode = creep.pickup(source);
				creep.jobQueueTask = undefined;
    			break;

            case "distributor":
                if (creep.room.memory.terminalTransfer == undefined  && (_.sum(creep.room.terminal.store) - creep.room.terminal.store[RESOURCE_ENERGY]) < 1) {
                    surrogate = creep.room.find(FIND_MY_CREEPS, {filter: (s) => s.memory.role == "energyTransporter" && s.memory.jobQueueTask == "distributor"});
                    if (surrogate.length > 0) {
                        for (var q in surrogate) {
                            delete surrogate[q].memory.jobQueueTask;
                            delete surrogate[q].memory.targetBuffer;
                            delete surrogate[q].memory.subRole;
                        }
                    }
                }
                else {
                    roleDistributor.run(creep);
                }
                break;
    	}

    	//Collecting finished
    	switch(returncode){
			case (OK):

			break;

			case (ERR_INVALID_TARGET):
				
			break;

			case (ERR_NOT_IN_RANGE):
				// move towards the source
                if (creep.memory.role != "stationaryHarvester" && creep.memory.role != "remoteStationaryHarvester") {
                    var code = creep.moveTo(source, {reusePath: moveReusePath()});
                }
				else {
				    var code = 0;
                }

				switch (code) {
					case -11:
						//creep.say("Tired");
					break;
					
					case -7:
						creep.say("Invalid target!");
					break;
					
					case -2:
						creep.say("No path!");
					break;

					case 0:
					break;

					default:
						creep.say(code);
					break;					
				}
			break;

			default:
			    if (returncode != undefined) {
                    creep.say(returncode);
                }
			break;
		}	
    }    
};
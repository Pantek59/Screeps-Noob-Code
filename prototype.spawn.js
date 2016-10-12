module.exports = function() {
    // create a new function for StructureSpawn
    StructureSpawn.prototype.createCustomCreep =
        function(energy, roleName, spawnID) {
			var size = 0;
			var sizelimit;
			var body = [];
			
			switch (roleName) {
				case "miniharvester":				
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 1;
					roleName = "harvester";
					break;

				case "remoteHarvester":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 10;
					break;
				
				case "harvester":
					body.push(WORK); //100
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
                    body.push(MOVE);  //50
					size=350;
					sizelimit = 6;
					break;

                case "energyTransporter":
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(MOVE);  //50
                    size=150;
                    sizelimit = 6;
                    break;

				case "stationaryHarvester":
					body.push(WORK); //100
					body.push(WORK); //100
					body.push(WORK); //100
                    body.push(WORK); //100
                    body.push(WORK); //100
					body.push(CARRY); //50
                    body.push(CARRY); //50
					body.push(MOVE);  //50
                    body.push(MOVE);  //50
					size=700;
					sizelimit = 1;
					break;
				
				case "upgrader":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=300;
					sizelimit = 6;
					break;

				case "bigUpgrader":
					body = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY];
					size=3250;
					sizelimit = 1;
					break;

				case "repairer":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 8;
					break;

				case "builder":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 9;
					break;

				case "wallRepairer":
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY);  //50
					body.push(MOVE);  //50
					size=250;
					sizelimit = 6;
					break;

				case "claimer":
					body.push(CLAIM);//600
					body.push(CLAIM);//600
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=1300;
					sizelimit = 1;
					break;

                case "bigClaimer":
                    body.push(CLAIM);//600
                    body.push(MOVE);  //50
                    body.push(CLAIM);//600
                    body.push(MOVE);  //50
                    body.push(CLAIM);//600
                    body.push(MOVE);  //50
                    body.push(CLAIM);//600
                    body.push(MOVE);  //50
                    body.push(CLAIM);//600
                    body.push(MOVE);  //50
                    size=3250;
                    sizelimit = 1;
                    break;

				case "protector":
					body.push(ATTACK);//80
					body.push(ATTACK);//80
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=260;
					sizelimit = 7;
					break;

				case "miner":
					body.push(WORK); //100
					body.push(WORK); //100
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(CARRY); //50
					body.push(MOVE);  //50
					body.push(MOVE);  //50
					size=500;
					sizelimit = 7;
					break;

                case "distributor":
                case "scientist":
                    body.push(CARRY); //50
                    body.push(CARRY);  //50
                    body.push(MOVE);  //50
                    size=150;
                    sizelimit = 5;
                    break;

                case "demolisher":
                    body.push(WORK); //100
                    body.push(WORK); //100
                    body.push(CARRY); //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    size=400;
                    sizelimit = 4;
                    break;

                case "remoteStationaryHarvester":
                    body.push(WORK); //100
                    body.push(WORK); //100
                    body.push(WORK); //100
                    body.push(WORK); //100
                    body.push(WORK); //100
                    body.push(CARRY); //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    size=700;
                    sizelimit = 1;
                    break;

                case "energyHauler":
                    body.push(WORK); //100
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(CARRY); //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    body.push(MOVE);  //50
                    size=1350;
                    sizelimit = 1;
                    break;

                case "attacker":
                    body.push(MOVE); //50
                    body.push(ATTACK); //80
                    size = 130;
                    sizelimit = 25;
                    break;

                case "healer":
                    body.push(MOVE); //50
                    body.push(HEAL); //250
                    size = 300;
                    sizelimit = 25;
                    break;

                case "einarr":
                    body.push(MOVE); //50
                    body.push(MOVE); //50
                    body.push(MOVE); //50
                    body.push(MOVE); //50
                    body.push(HEAL); //250
                    body.push(HEAL); //250
                    body.push(HEAL); //250
                    body.push(ATTACK); //80
                    size = 1030;
                    sizelimit = 6;
                    break;

                case "transporter":
                    body.push(MOVE); //50
                    body.push(CARRY); //50
                    size = 100;
                    sizelimit = 25;
                    break;

				default:
					body.push(WORK); //100
					body.push(CARRY); //50
					body.push(MOVE);  //50
					size=200;
					sizelimit = 8;
					break;
			}
			
         // create a balanced body as big as possible with the given energy
         var numberOfParts = Math.floor(energy / size);
         var finalBody = [];

		if (numberOfParts > sizelimit) {
			numberOfParts = sizelimit;
		}

		for (let i = 0; i < numberOfParts; i++) {
			for (let part = 0; part < body.length; part++) {
				finalBody.push(body[part]);
			}
		}

		//Check for boost
        var boost = undefined;
        for (let l in this.room.memory.boostList) {
            if (this.room.memory.boostList[l].role == roleName) {
                //Creep should get boost entry
                let boostEntry = this.room.memory.boostList[l];
                boost = boostEntry.mineralType;
                if (boostEntry.volume >= 0) {
                    boostEntry.volume--;
                    if (boostEntry.volume == 0) {
                        delBoost(this.room.name, l);
                    }
                    else {
                        this.room.memory.boostList[l] = boostEntry;
                    }
                }
            }
        }


		// create creep with the created body and the given role
        if (this.room.memory.boostList == undefined || 3 == 3) {
            return this.createCreep(finalBody, undefined, {
                role: roleName,
                working: false,
                spawn: spawnID,
                jobQueueTask: undefined,
                homeroom: this.room.name,
                boost: boost
            });
        }
	}
};
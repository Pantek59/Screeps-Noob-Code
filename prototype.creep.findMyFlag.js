module.exports = function() {
    // find unoccupied flag and return flag name
	Creep.prototype.findMyFlag =
	function(flagFunction) {
	    var flagList;
        var flag;
        var flagCreeps;
        var volume;
        //TODO Claimers should only get flag if the reservation ticker is below 3000
        //TODO Flags "haulEnergy" are sometimes visited by two remoteStationaryHarvesters

		if (flagFunction == "narrowSource" || flagFunction == "remoteController") {
		    // static volumes
            volume = 1;
        }

        if (this.memory.currentFlag != undefined && this.memory.currentFlag != -1) {
            // There is a current flag
            if (Game.time % 3 == 0) {
                flag = Game.flags[this.memory.currentFlag];
                if (flag == undefined) {
                    volume = 0;
                    delete this.memory.currentFlag;
                }
                else if (volume == undefined) {
                    //dynamic volume
                    volume = flag.memory.volume;
                }
                flagCreeps = _.filter(Game.creeps,{ currentFlag: this.memory.currentFlag});

                if (this.memory.currentFlag != undefined && flagCreeps.length <= volume) {
                    if (flagFunction == "haulEnergy") {
                        if (this.memory.role == "remoteStationaryHarvester") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'remoteStationaryHarvester', currentFlag: this.memory.currentFlag}});
                            if (peers.length > 1) {
                                //Two remoteStationaryHarvesters on same source
                                delete this.memory.currentFlag;
                            }
                            else {return this.memory.currentFlag;}
                        }
                        else if (this.memory.role == "energyHauler") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'energyHauler', spawn: this.room.memory.masterSpawn}});
                            if (peers.length >= flag.memory.volume) {
                                delete this.memory.currentFlag;
                            }
                            else {return this.memory.currentFlag;}
                        }
                    }

                    if (flagFunction == "unitGroup") {
                        var peers = _.filter(flagCreeps, {memory: {role: this.memory.role,currentFlag: this.memory.currentFlag}});
                        if (peers.length > flag.memory[this.memory.role]) {
                            //Too many creeps for this flag
                            delete this.memory.currentFlag;
                        }
                        else {return this.memory.currentFlag;}
                    }
                    //creep still needed at this flag -> OK
                    if (this.memory.currentFlag != undefined) {
                        return this.memory.currentFlag;
                    }
                }
                else {delete this.memory.currentFlag;}
            }
            else {return this.memory.currentFlag;}
        }
        if (this.memory.currentFlag == undefined || this.memory.currentFlag == -1) {
            //Search for new flag necessary
            flagList = _.filter(Game.flags, {memory: {function: flagFunction, spawn: this.memory.spawn}});

            for (var flag in flagList) {
                this.memory.currentFlag = flagList[flag].name;

                // Flags with homogeneous volume
                flagCreeps = _.filter(Game.creeps, {memory: {currentFlag: this.memory.currentFlag}});

                switch (flagFunction) {
                    case "haulEnergy":
                        if (this.memory.role == "remoteStationaryHarvester") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'remoteStationaryHarvester', currentFlag: this.memory.currentFlag}});
                            if (peers.length <= 1) {
                                return this.memory.currentFlag;
                            }
                        }
                        else if (this.memory.role == "energyHauler") {
                            var peers = _.filter(flagCreeps,{ memory: { role: 'energyHauler', currentFlag: this.memory.currentFlag}});
                            if (peers.length <= (flagList[flag].memory.volume - 1)) {
                                return this.memory.currentFlag;
                            }
                        }
                        break;

                    case "unitGroup":
                        var peers = _.filter(flagCreeps, {memory: {role: this.memory.role, currentFlag: this.memory.currentFlag}});
                        if (peers.length <= flagList[flag].memory[this.memory.role]) {
                            return this.memory.currentFlag;
                        }
                        break;

                    default:
                        if (flagFunction == "narrowSource" || flagFunction == "remoteController") {
                            // static volumes
                            volume = 1;
                        }
                        else {
                            volume = flagList[flag].memory.volume;
                        }

                        if (flagCreeps.length <= volume) {
                            return this.memory.currentFlag;
                        }
                        break;
                }
            }
            return undefined;
        }
    }
};
Creep.prototype.roleRemoteHarvester = function() {
    if (this.getRidOfMinerals() == false) { // if creep is bringing energy to a structure but has no energy left
        if (_.sum(this.carry) == 0) {
            // switch state to harvesting
            if (this.memory.working == true) {
                delete this.memory.path;
                delete this.memory._move;
            }
            this.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (_.sum(this.carry) == this.carryCapacity  || (this.room.name == this.memory.homeroom && _.sum(this.carry) > 0)) {
            if (this.memory.working == false) {
                delete this.memory.path;
                delete this.memory._move;
            }
            this.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (this.memory.working == true) {
            //Find construction sites
            var constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES);

            if (constructionSites.length > 0 && this.room.name != this.memory.homeroom) {
                // Construction sites found, build them!
                this.roleBuilder();
            }
            else {
                var road = this.pos.lookFor(LOOK_STRUCTURES);

                if (this.room.controller != undefined && (this.room.controller.owner == undefined || this.room.controller.owner.username != Game.getObjectById(this.memory.spawn).room.controller.owner.username ) && road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD && this.room.name != this.memory.homeroom) {
                    // Found road to repair
                    this.repair(road[0]);
                }
                else {
                    // Find exit to spawn room
                    var spawn = Game.getObjectById(this.memory.spawn);
                    if (this.room.name != this.memory.homeroom) {
                        //still in new room, go out
                        this.useFlowPathTo(spawn.pos);
                    }
                    else {
                        // back in spawn room
                        // find closest spawn, extension, tower or container which is not full
                        var structure = this.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_EXTENSION);

                        // if we found one
                        if (structure != null) {
                            // try to transfer energy, if it is not in range
                            if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                // move towards it
                                this.moveTo(structure, {reusePath: moveReusePath(), ignoreCreeps: false});
                            }
                        }
                        else {
                            this.say("No Structure!");
                        }
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else if (this.memory.statusHarvesting == false || this.memory.statusHarvesting == undefined) {
            //Find remote source
            var remoteSource = Game.flags[this.findMyFlag("remoteSource")];
            if (remoteSource != -1 && remoteSource != undefined) {

                // Find exit to target room
                if (remoteSource.room == undefined || this.room.name != remoteSource.room.name) {
                    //still in old room, go out
                    if (!this.memory.path) {
                        this.memory.path = this.pos.findPathTo(remoteSource, {ignoreCreeps: false});
                    }
                    if (this.moveByPath(this.memory.path) != OK) {
                        this.memory.path = this.pos.findPathTo(remoteSource, {ignoreCreeps: false});
                        this.moveByPath(this.memory.path)
                    }
                }
                else {
                    //new room reached, start harvesting
                    if (this.room.memory.hostiles.length == 0) {
                        //No enemy creeps
                        let mySource = remoteSource.pos.findClosestByRange(FIND_SOURCES);
                        let returnCode = this.harvest(mySource);
                        if (returnCode == ERR_NOT_IN_RANGE) {
                            this.useFlowPathTo(mySource.pos);
                        }
                        else if (returnCode == OK) {
                            this.memory.statusHarvesting = mySource.id;
                        }
                    }
                    else {
                        //Hostiles found
                        this.memory.fleeing = true;
                        this.goToHomeRoom();
                    }
                }
            }
        }
        else {
            // Creep is harvesting, try to keep harvesting
            if (this.harvest(Game.getObjectById(this.memory.statusHarvesting)) != OK) {
                //console.log(this.harvest(Game.getObjectById(this.memory.statusHarvesting)));
                delete this.memory.statusHarvesting;
            }
        }
    }
};

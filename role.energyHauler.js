Creep.prototype.roleEnergyHauler = function() {
    if (_.sum(this.carry) == 0) {
        // switch state to collecting
        if (this.memory.working == true) {
            delete this.memory._move;
        }
        this.memory.working = false;
    }
    else if (_.sum(this.carry) == this.carryCapacity || (this.room.name == this.memory.homeroom && _.sum(this.carry) > 0)) {
        // creep is collecting energy but is full
        if (this.memory.working == false) {
            delete this.memory._move;
        }
        this.memory.working = true;
    }
    if (this.memory.working == true) {
        // creep is supposed to transfer energy to a structure
        // Find construction sites
        var constructionSites = this.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 5);
        if (constructionSites.length > 0 && this.room.name != this.memory.homeroom) {
            // Construction sites found, build them!
            let site = this.pos.findClosestByPath(constructionSites);
            if (this.build(site) == ERR_NOT_IN_RANGE) {
                this.moveTo(site, {reusePath: moveReusePath()});
            }
        }
        else {
            // Move to structure
            var road = this.pos.lookFor(LOOK_STRUCTURES);
            if (this.room.controller != undefined && (this.room.controller.owner == undefined || this.room.controller.owner.username != Game.getObjectById(this.memory.spawn).room.controller.owner.username ) && road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD && this.room.name != this.memory.homeroom) {
                // Found road to repair
                if (this.getActiveBodyparts(WORK) > 0) {
                    this.repair(road[0]);
                }
                else {
                    var spawn = Game.getObjectById(this.memory.spawn);
                    this.moveTo(spawn, {reusePath: moveReusePath()})
                }
            }
            else {
                if (this.room.name != this.memory.homeroom) {
                    // Find exit to spawn room
                    //this.moveTo(Game.getObjectById(this.memory.spawn), {reusePath: moveReusePath()})
                    this.useFlowPathTo(Game.getObjectById(this.memory.spawn).pos);
                }
                else {
                    // back in spawn room
                    var structure;
                    if (_.sum(this.carry) == this.carry[RESOURCE_ENERGY]) {
                        //Creep has only energy loaded
                        structure = this.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_EXTENSION);
                    }
                    else {
                        //Creep has minerals loaded
                        structure = this.room.storage;
                    }

                    // if we found one
                    if (structure != null) {
                        // try to transfer energy, if it is not in range
                        for (let c in this.carry) {
                            if (this.transfer(structure, c) == ERR_NOT_IN_RANGE) {
                                // move towards it
                                this.moveTo(structure, {reusePath: moveReusePath(), ignoreCreeps: false});
                            }
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
    else {
        //Find remote source
        var remoteSource = Game.flags[this.findMyFlag("haulEnergy")];
        if (remoteSource != undefined) {
            // Find exit to target room
            if (this.room.name != remoteSource.pos.roomName) {
                //still in old room, go out
                this.moveTo(remoteSource, {reusePath: moveReusePath()});
            }
            else {
                //new room reached, start collecting
                if (this.room.memory.hostiles.length == 0) {
                    let flag = Game.flags[this.memory.currentFlag];
                    //No enemy creeps
                    let container = flag.pos.lookFor(LOOK_STRUCTURES);
                    container = _.filter(container, {structureType: STRUCTURE_CONTAINER});
                    if (container.length > 0 && _.sum(container[0].store) > 0) {
                        for (let s in container[0].store) {
                            if (this.withdraw(container[0], s) == ERR_NOT_IN_RANGE) {
                                //this.moveTo(container[0], {reusePath: moveReusePath()});
                                this.useFlowPathTo(container[0].pos);
                            }
                        }
                    }
                    else {
                        this.roleCollector();
                    }
                }
                else {
                    //Hostiles creeps in new room
                    this.memory.fleeing = true;
                    this.goToHomeRoom();
                }
            }
        }
    }
};

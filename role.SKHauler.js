Creep.prototype.roleSKHauler = function() {
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
            if (this.room.controller != undefined && (this.room.controller.owner == undefined || this.room.controller.owner.username != Game.getObjectById(creep.memory.spawn).room.controller.owner.username ) && road[0] != undefined && road[0].hits < road[0].hitsMax && road[0].structureType == STRUCTURE_ROAD && this.room.name != this.memory.homeroom) {
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
                    this.moveTo(Game.getObjectById(this.memory.spawn), {reusePath: moveReusePath()})
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
    else {
        //Find remote source
        var flag = Game.flags[this.findMyFlag("SKHarvest")];
        if (flag == undefined) {
            flag = Game.flags[this.findMyFlag("SKMine")];
        }

        if (flag != undefined) {
            // Find exit to target room
            if (this.room.name != flag.pos.roomName) {
                //still in old room, go out
                this.moveTo(flag, {reusePath: moveReusePath()});
            }
            else {
                //new room reached, find lair
                if (this.memory.myLair == undefined) {
                    let myLair = flag.pos.findClosestByPath(FIND_STRUCTURES, {filter: (k) => k.structureType == STRUCTURE_KEEPER_LAIR});
                    if (myLair != null) {
                        this.memory.myLair = myLair.id;
                    }
                }
                var myLair = Game.getObjectById(this.memory.myLair);
                let hostiles = [];
                for (let h in this.room.memory.hostiles) {
                    hostiles.push(Game.getObjectById(this.room.memory.hostiles[h]));
                }
                var invaders = _.filter(hostiles, function (h) { return h.owner.username != "Source Keeper"});

                if (invaders.length > 0) {
                    this.flee(hostiles, 10);
                }
                else {
                    //Check for source keeper status
                    let sourceKeeper = flag.pos.findInRange(FIND_HOSTILE_CREEPS, 8, {filter: (c) => c.owner.username == "Source Keeper"});
                    if (sourceKeeper.length > 0) {
                        //Source is guarded by source keeper -> retreat
                        if (this.pos.getRangeTo(sourceKeeper[0]) < 7) {
                            this.goToHomeRoom();
                        }
                        else {
                            this.memory.sleep = 10;
                        }
                    }
                    else {
                        //No source keeper found
                        if (myLair.ticksToSpawn < 15) {
                            //Source Keeper spawning soon
                            if (this.pos.getRangeTo(myLair) < 7) {
                                this.goToHomeRoom();
                            }
                            else {
                                this.memory.sleep = 5;
                            }
                        }
                        else {
                            //No enemy creeps -> work
                            var container = flag.pos.lookFor(LOOK_STRUCTURES);
                            container = _.filter(container, {structureType: STRUCTURE_CONTAINER});
                            if (container.length > 0 && _.sum(container[0].store) > 0) {
                                for (let s in container[0].store) {
                                    if (this.withdraw(container[0], s) == ERR_NOT_IN_RANGE) {
                                        this.moveTo(container[0], {reusePath: moveReusePath()});
                                    }
                                }
                            }
                            else {
                                if (this.pos.getRangeTo(flag) > 8) {
                                    this.moveTo(flag, {reusePath: moveReusePath()})
                                }
                                else {
                                    this.memory.sleep = 10;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
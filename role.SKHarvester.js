Creep.prototype.roleSKHarvester = function() {
    if (this.memory.statusHarvesting == undefined || this.memory.statusHarvesting == false || this.carry.energy == this.carryCapacity || Game.time % 7 == 0) {
        if (this.memory.currentFlag == undefined) {
            this.memory.currentFlag = this.findMyFlag("SKHarvest");
        }

        if (this.memory.currentFlag == undefined) {
            console.log(this.name + " has no sources to stationary harvest in room " + this.room.name + ".");
        }
        else {
            var flag = Game.flags[this.memory.currentFlag];

            if (flag != undefined) {
                if (flag.pos.roomName != this.room.name) {
                    // Creep not in assigned room
                    if (this.storeAllBut() == true) {
                        this.moveTo(flag, {reusePath: moveReusePath()});
                    }
                }
                else {
                    // Creep in SK Room
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
                            //No Source Keeper around
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
                                //Safe to work
                                if (this.pos.isEqualTo(flag) == false) {
                                    this.moveTo(flag, {reusePath: moveReusePath()});
                                }
                                else {
                                    if (this.carry.energy > 0 && sourceKeeper.length == 0) {
                                        //Identify and save container
                                        var buildContainers = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_ROAD});
                                        var repairContainers = this.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.hits < s.hitsMax});
                                        if (buildContainers.length > 0) {
                                            this.build(buildContainers[0]);
                                        }
                                        else if (repairContainers.length > 0) {
                                            this.repair(repairContainers[0]);
                                        }
                                        else {
                                            if (this.memory.container == undefined) {
                                                var container;
                                                var containers = this.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.storeCapacity - _.sum(s.store) > 0) || (s.structureType == STRUCTURE_LINK && s.energyCapacity - s.energy) > 0});
                                                if (containers.length > 0) {
                                                    this.memory.container = containers[0].id;
                                                    container = containers[0];
                                                }
                                            }
                                            else {
                                                container = Game.getObjectById(this.memory.container);
                                            }

                                            if (this.transfer(container, RESOURCE_ENERGY) != OK) {
                                                delete this.memory.container;
                                                containers = this.pos.findInRange(FIND_STRUCTURES, 0, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                                                var constructionSites = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                                                if (containers.length == 0 && constructionSites.length == 0 && this.pos.isEqualTo(flag) == true) {
                                                    this.pos.createConstructionSite(STRUCTURE_CONTAINER);
                                                }
                                            }
                                        }
                                    }
                                    else if (this.carry.energy < this.carryCapacity && sourceKeeper.length == 0) {
                                        //Time to refill
                                        //TODO Does not pickup energy on the ground
                                        let energy = this.pos.lookFor(LOOK_ENERGY);
                                        if (energy.length > 0) {
                                            this.pickup(energy[0]);
                                        }
                                        else {
                                            //Identify and save source
                                            if (this.memory.source == undefined) {
                                                var source = this.pos.findClosestByRange(FIND_SOURCES);
                                                this.memory.source = source.id;
                                            }
                                            else {
                                                var source = Game.getObjectById(this.memory.narrowSource);
                                            }
                                            if (source == undefined) {
                                                delete this.memory.source;
                                            }
                                            else if (source.energy == 0) {
                                                this.memory.sleep = source.ticksToRegeneration;
                                            }
                                            else {
                                                if (this.harvest(source) != OK) {
                                                    this.memory.statusHarvesting = false;
                                                    delete this.memory.narrowSource;
                                                }
                                                else {
                                                    this.memory.statusHarvesting = source.id;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else {
                console.log(this.name + " in room " + this.room.name + " has a problem.");
            }
        }
    }
    else {
        // Creep is harvesting, try to keep harvesting
        // TODO Energy pickup
        let energy = this.pos.lookFor(LOOK_ENERGY);
        if (energy.length > 0) {
            this.pickup(energy[0]);
            this.memory.statusHarvesting = false;
        }
        else {
            var source = Game.getObjectById(this.memory.statusHarvesting);
            if (this.harvest(source) != OK || this.carry.energy == this.carryCapacity) {
                this.memory.statusHarvesting = false;
            }
        }
    }
};
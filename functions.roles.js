/** UPGRADER **/
Creep.prototype.roleUpgrader = function() {
    if (this.goToHomeRoom() == true) {
        // if creep is bringing energy to the controller but has no energy left
        if (this.memory.working == true && this.carry.energy == 0) {
            // switch state
            this.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (this.memory.working == false && this.carry.energy == this.carryCapacity) {
            // switch state
            this.memory.working = true;
        }

        // if creep is supposed to transfer energy to the controller
        if (this.memory.working == true) {
            if (this.room.memory.hostiles.length > 0) {
                // Hostiles present in room
                this.towerEmergencyFill();
            }
            else if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                // try to upgrade the controller, if not in range, move towards the controller
                let path = this.pos.findPathTo(this.room.controller, {ignoreCreeps: false});
                if (path.length == 0) {
                    path = this.pos.findPathTo(this.room.controller, {ignoreCreeps: true});
                }
                this.moveByPath(path);
            }

            if (Game.time % 11 == 0) {
                if (this.pos.getRangeTo(this.room.controller) > 1) {
                    this.moveTo(this.room.controller, {reusePath: moveReusePath(), ignoreCreeps: true});
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};

/** COLLECTOR **/
Creep.prototype.roleCollector = function() {
    // check for picked up minerals
    if (this.memory.statusHarvesting == undefined || this.memory.statusHarvesting == false) {
        var container;
        if (this.memory.role == "harvester" || this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
            // find closest container with energy
            if (this.room.energyCapacityAvailable > this.room.energyAvailable) {
                if (this.room.memory.terminalTransfer == undefined && this.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                    //spawn not full, terminal transfer ongoing -> find source, container or storage if available
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL);
                    }
                }
                else {
                    //spawn not full, no terminal transfer ongoing -> find source, container, terminal or storage if available
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    }
                }

            }
            else if (this.room.storage != undefined && this.room.storage.storeCapacity - _.sum(this.room.storage.store > 0)) {
                if (this.room.memory.terminalTransfer == undefined && this.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                    //spawn full and storage with space exists or towers need energy
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_TERMINAL);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_TERMINAL);
                    }
                }
                else {
                    //spawn full and storage with space exists or towers need energy
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_CONTAINER);
                    }
                }
            }
            else {
                if (this.room.memory.terminalTransfer == undefined && this.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_TERMINAL);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK, STRUCTURE_TERMINAL);
                    }
                }
                else {
                    if (this.memory.role == "harvester") {
                        container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK);
                    }
                    if (this.memory.role == "energyTransporter" || this.memory.role == "distributor" || this.memory.role == "scientist") {
                        container = this.findResource(RESOURCE_ENERGY, STRUCTURE_LINK);
                    }
                }
            }
            if (container == undefined) {
                //Nothing to do
                let mineralsContainers = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && (_.sum(s.store) > s.store[RESOURCE_ENERGY] || (_.sum(s.store) > 0 && s.store[RESOURCE_ENERGY == 0]))});
                if (mineralsContainers.length == 0) {
                    this.memory.sleep = 5;
                    return (-1);
                }
                else {
                    //get minerals from container
                    if (this.memory.tidyFull == undefined && _.sum(this.carry) < this.carryCapacity) {
                        //creep not full
                        for (let e in mineralsContainers[0].store){
                            if (e != "energy" && this.withdraw(mineralsContainers[0],e) == ERR_NOT_IN_RANGE) {
                                this.moveTo(mineralsContainers[0],{reusePath: moveReusePath()});
                            }
                        }
                    }
                    else {
                        //creep full
                        this.memory.tidyFull = true;
                        this.storeAllBut();
                        if (_.sum(this.carry) == 0) {
                            delete this.memory.tidyFull;
                        }
                    }
                }
            }
            else if (container.ticksToRegeneration == undefined && (container.energy == undefined || container.energy < 3000)) {
                //container
                if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.moveTo(container, {reusePath: moveReusePath()});
                }
            }
            else {
                //Source
                if (this.harvest(container) == ERR_NOT_IN_RANGE) {
                    this.moveTo(container, {reusePath: moveReusePath()});
                }
            }
        }
        else {
            //no room harvester role
            // find closest source
            if (this.room.memory.terminalTransfer == undefined && this.checkTerminalLimits(RESOURCE_ENERGY).amount > 0) {
                container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL);
            }
            else {
                container = this.findResource(RESOURCE_ENERGY, FIND_SOURCES, STRUCTURE_LINK, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
            }
            if (container != undefined) {
                var res = this.withdraw(container, RESOURCE_ENERGY);

                if (res != OK && res != ERR_NOT_IN_RANGE) {
                    res = this.harvest(container)
                }

                if (res == ERR_NOT_IN_RANGE) {
                    this.moveTo(container, {reusePath: moveReusePath()});
                }
            }
            else {
                return -1;
            }
        }
    }
    else {
        // Creep is harvesting, try to keep harvesting
        if (this.harvest(Game.getObjectById(this.memory.statusHarvesting)) != OK) {
            this.memory.statusHarvesting = false;
        }
    }
    return OK;
};

/** HARVESTER **/
Creep.prototype.roleHarvester = function() {
    if (this.goToHomeRoom() == true) {
        if (this.carry.energy == 0) {
            // if creep is bringing energy to a structure but has no energy left
            if (this.memory.working == true) {
                delete this.memory.targetBuffer;
            }
            this.memory.working = false;
        }
        else if (this.carry.energy == this.carryCapacity) {
            // if creep is harvesting energy but is full
            if (this.memory.working == false) {
                delete this.memory.targetBuffer;
            }
            this.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (this.memory.working == true) {
            // find closest spawn, extension or tower which is not full
            var structure;

            if (this.room.memory.hostiles.length > 0 && this.room.find(FIND_MY_CREEPS, {filter: (s) => (s.memory.role == "protector")}).length == 0) {
                //no tower refill;
                structure = this.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION);
            }
            else {
                //towers included in energy distribution
                structure = this.findResource(RESOURCE_SPACE, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TOWER);
            }
            var nuker;
            var powerSpawn;
            if (this.room.memory.roomArrayNukers != undefined) {
                nuker = Game.getObjectById(this.room.memory.roomArrayNukers[0]);
            }
            else {
                nuker = null;
            }
            if (this.room.memory.roomArrayPowerSpawns != undefined) {
                powerSpawn = Game.getObjectById(this.room.memory.roomArrayPowerSpawns[0]);
            }
            else {
                powerSpawn = null;
            }

            if (structure != undefined && structure != null) {
                // if we found one -> try to transfer energy, if it is not in range
                if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(structure, {reusePath: moveReusePath()});
                }
            }
            else if (nuker != null && nuker.energy < nuker.energyCapacity && this.room.storage.store[RESOURCE_ENERGY] > 50000) {
                //Bring energy to nuker
                if (this.transfer(nuker, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(nuker, {reusePath: moveReusePath()});
                }
            }
            else if (powerSpawn != null && powerSpawn.energy < powerSpawn.energyCapacity && this.room.storage.store[RESOURCE_ENERGY] > 50000) {
                //Bring energy to power spawn
                if (this.transfer(powerSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(powerSpawn, {reusePath: moveReusePath()});
                }
            }
            else {
                let labBreaker = false;
                if (this.room.memory.boostLabs != undefined) {
                    //Check boost labs for energy
                    for (let b in this.room.memory.boostLabs) {
                        let lab = Game.getObjectById(this.room.memory.boostLabs[b]);
                        if (lab.energyCapacity > lab.energy) {
                            //lab needs energy
                            if (this.transfer(lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                // move towards it
                                this.moveTo(lab, {reusePath: moveReusePath()});
                            }
                            labBreaker = true;
                            break;
                        }
                    }
                }

                if (labBreaker == false) {
                    //Nothing needs energy -> store it
                    var container = this.findResource(RESOURCE_SPACE, STRUCTURE_STORAGE);
                    if (container == null || container == undefined) {
                        container = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
                    }

                    if (this.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.moveTo(container, {reusePath: moveReusePath()});
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};

/** PROTECTOR **/
Creep.prototype.roleProtector = function() {
        var nameFlag = this.findMyFlag("protector");
        var protectorFlag = Game.flags[nameFlag];
        if (this.room.memory.hostiles.length > 0) {
            // Attack code
            var hostiles = _.filter(this.room.find(FIND_HOSTILE_CREEPS), function (c) { return isHostile(c)});
            var target = this.pos.findClosestByPath(hostiles);

            if (this.attack(target) == ERR_NOT_IN_RANGE) {
                this.moveTo(target, {reusePath: moveReusePath()});
            }
        }
        else if (protectorFlag != undefined) {
            //Move to flag if not there
            let range = this.pos.getRangeTo(protectorFlag);
            if (range > 5) {
                this.moveTo(protectorFlag, {ignoreCreeps: false, reusePath: moveReusePath()});
            }
        }
        else {
            //No flag for protector anymore
            if (this.goToHomeRoom() == true) {
                let range = this.pos.getRangeTo(this.room.controller);
                if (range > 1) {
                    this.moveTo(this.room.controller, {reusePath: moveReusePath(), ignoreCreeps: true});
                }
            }
        }
    };

/** BUILDER **/
Creep.prototype.roleBuilder = function() {
    // check for home room
    if (this.room.name != this.memory.homeroom && this.memory.role != "remoteHarvester" && this.memory.role != "energyHauler") {
        //return to home room
        var hometarget = Game.getObjectById(this.memory.spawn);
        this.moveTo(hometarget, {reusePath: moveReusePath()});
    }
    else {
        if (this.memory.statusBuilding != undefined) {
            if (this.build(Game.getObjectById(this.memory.statusBuilding)) != OK) {
                delete this.memory.statusBuilding;
            }
        }
        // if creep is trying to complete a constructionSite but has no energy left
        if (this.carry.energy == 0) {
            // switch state
            this.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (this.memory.working == false && this.carry.energy == this.carryCapacity) {
            // switch state
            this.memory.working = true;
        }
        // if creep is supposed to complete a constructionSite
        if (this.memory.working == true) {
            if (this.room.memory.hostiles.length > 0) {
                this.towerEmergencyFill();
            }
            else {
                // find closest constructionSite
                var constructionSite;
                if (this.memory.myConstructionSite == undefined) {
                    constructionSite = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                    if (constructionSite == null) {
                        constructionSite = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_EXTENSION});
                    }
                    if (constructionSite == null) {
                        constructionSite = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {filter: (s) => s.structureType != STRUCTURE_RAMPART});
                    }
                    if (constructionSite != null && constructionSite != undefined) {
                        this.memory.myConstructionSite = constructionSite.id;
                    }
                }
                else {
                    constructionSite = Game.getObjectById(this.memory.myConstructionSite);
                    if (constructionSite == null) {
                        delete this.memory.myConstructionSite;
                    }
                }
                // if one is found
                if (constructionSite != undefined) {
                    // try to build, if the constructionSite is not in range
                    var result = this.build(constructionSite);
                    if (result == ERR_NOT_IN_RANGE) {
                        // move towards the constructionSite
                        this.moveTo(constructionSite, {reusePath: moveReusePath()});
                    }
                    else if (result == OK) {
                        this.memory.statusBuilding = constructionSite.id;
                    }
                }
                // if no constructionSite is found
                else {
                    // go upgrading the controller
                    if (this.room.controller.level < 8) {
                        this.roleUpgrader();
                    }
                    else {
                        let spawn = Game.getObjectById(this.memory.spawn);
                        if (spawn.recycleCreep(this) == ERR_NOT_IN_RANGE) {
                            this.moveTo(spawn, {reusePath: moveReusePath()});
                        }
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};

/** REPAIRER **/
Creep.prototype.roleRepairer = function() {
    // check for home room
    if (this.room.name != this.memory.homeroom && this.memory.role != "remoteHarvester") {
        //return to home room
        var hometarget = Game.getObjectById(this.memory.spawn);
        this.moveTo(hometarget, {reusePath: moveReusePath()});
    }
    else {
        // if creep is trying to repair something but has no energy left
        if (this.carry.energy == 0) {
            // 4witch state
            this.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (this.memory.working == false && this.carry.energy == this.carryCapacity) {
            // switch state
            this.memory.working = true;
        }

        // if creep is supposed to repair something
        if (this.memory.working == true) {
            if (this.room.memory.hostiles.length > 0) {
                // Hostiles present in room
                this.towerEmergencyFill();
            }
            else {

                if (this.room.controller.level == 8 && this.room.controller.ticksToDowngrade < 10000) {
                    // Refresh level 8 controller
                    if (this.upgradeController(this.room.controller) == ERR_NOT_IN_RANGE) {
                        // try to upgrade the controller, if not in range, move towards the controller
                        this.moveTo(this.room.controller, {reusePath: moveReusePath()});
                    }
                }
                else if (this.room.memory.roomArraySpawns.length > 0) {
                    let structure;
                    if (this.memory.myStructure != undefined) {
                        structure = Game.getObjectById(this.memory.myStructure);
                        if (structure != null && structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART || (structure.structureType == STRUCTURE_RAMPART && structure.hits < 100000)) {
                            this.memory.myStructure = structure.id;
                        }
                        else {
                            delete this.memory.myStructure;
                        }
                    }

                    if (this.memory.myStructure == undefined) {
                        structure = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART) || (s.structureType == STRUCTURE_RAMPART && s.hits < 100000)});
                    }
                    if (structure != undefined) {
                        this.memory.myStructure = structure.id;
                        var result = this.repair(structure);
                        if (result == ERR_NOT_IN_RANGE) {
                            this.moveTo(structure, {reusePath: moveReusePath()});
                        }
                    }
                    // if we can't fine one
                    else {
                        // look for construction sites
                        this.roleBuilder();
                    }
                }
                else {
                    //room without spawn
                    var constructionSite = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_ROAD});
                    if (constructionSite == null) {
                        constructionSite = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                    }
                    if (this.build(constructionSite) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        this.moveTo(constructionSite, {reusePath: moveReusePath()});
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};

/** WALL REPAIRER **/
Creep.prototype.roleWallRepairer = function() {
    // check for home room
    if (this.room.name != this.memory.homeroom) {
        //return to home room
        var hometarget = Game.getObjectById(this.memory.spawn);
        this.moveTo(hometarget, {reusePath: moveReusePath()});
    }
    else {
        // if creep is trying to repair something but has no energy left
        if (this.carry.energy == 0) {
            // switch state
            this.memory.working = false;
            delete this.memory.statusRepairing;
        }
        // if creep is full of energy but not working
        else if (this.carry.energy == this.carryCapacity) {
            // switch state
            this.memory.working = true;
        }

        // if creep is supposed to repair something
        if (this.memory.working == true) {
            if (this.memory.statusRepairing == undefined) {
                var rampartsBeingSetUp = this.room.find(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits < 70000});
                var constructionSite = this.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, { filter: (s) => s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART});
                if (constructionSite != null && rampartsBeingSetUp.length == 0) {
                    // Construction sites found
                    var position = constructionSite.pos;
                    var buildResult = this.build(constructionSite)
                    if (buildResult == ERR_NOT_IN_RANGE) {
                        // move towards the constructionSite
                        this.moveTo(constructionSite, {reusePath: moveReusePath()});
                    }
                    else if (buildResult == OK) {
                        var builtObject = position.lookFor(LOOK_STRUCTURES);
                        this.memory.statusRepairing = builtObject.id;
                    }
                }
                else {
                    var target = undefined;
                    var ramparts = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_RAMPART});
                    ramparts = _.sortBy(ramparts,"hits");

                    var walls = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_WALL});
                    walls = _.sortBy(walls,"hits");

                    if (walls.length > 0 && ((ramparts[0] != undefined && walls[0].hits < ramparts[0].hits) || (ramparts.length == 0))) {
                        target = walls[0];
                    }
                    else if (ramparts.length > 0) {
                        target = ramparts[0];
                    }

                    // if we find a wall that has to be repaired
                    if (target != undefined) {
                        var result = this.repair(target);
                        if (result == ERR_NOT_IN_RANGE) {
                            // move towards it
                            this.moveTo(target, {reusePath: moveReusePath()});
                            this.memory.statusRepairing = target.id;
                        }
                        else if (result == OK) {
                            this.memory.statusRepairing = target.id;
                        }
                        else {
                            delete this.memory.statusRepairing;
                        }
                    }
                    // if we can't fine one
                    else {
                        // look for construction sites
                        this.roleBuilder();
                    }
                }
            }
            else {
                if (this.repair(Game.getObjectById(this.memory.statusRepairing)) != OK) {
                    if (this.moveTo(Game.getObjectById(this.memory.statusRepairing), {reusePath: moveReusePath()}) != OK) {
                        delete this.memory.statusRepairing;
                    }
                }
            }
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};

/** REMOTE HARVESTER **/
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
                        if (!this.memory.path) {
                            this.memory.path = this.pos.findPathTo(spawn, {
                                heuristicWeight: 1000,
                                ignoreCreeps: false
                            });
                        }
                        if (this.moveByPath(this.memory.path) == ERR_NOT_FOUND) {
                            this.memory.path = this.pos.findPathTo(spawn, {
                                heuristicWeight: 1000,
                                ignoreCreeps: false
                            });
                            this.moveByPath(this.memory.path);
                        }
                    }
                    else {
                        // back in spawn room
                        delete this.memory.path;
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
                        if (this.roleCollector() != OK) {
                            this.moveTo(remoteSource, {reusePath: moveReusePath()});
                        }
                    }
                    else {
                        if (remoteSource.memory.skr == true) {
                            // SourceKeeper Room
                            let sourceKeeper = remoteSource.pos.findInRange(FIND_HOSTILE_CREEPS, 5, function (c) { return isHostile(c)});
                            if (sourceKeeper.length > 0) {
                                //Source is guarded by source keeper -> retreat
                                if (this.pos.getRangeTo(remoteSource) < 6) {
                                    this.moveTo(remoteSource, {flee: true, reusePath: moveReusePath()});
                                }
                                else {
                                    this.memory.sleep = 20;
                                }
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
        }
        else {
            // Creep is harvesting, try to keep harvesting
            if (this.harvest(Game.getObjectById(this.memory.statusHarvesting)) != OK) {
                console.log(this.harvest(Game.getObjectById(this.memory.statusHarvesting)));
                delete this.memory.statusHarvesting;
            }
        }
    }
};

/** CLAIMER **/
Creep.prototype.roleClaimer = function() {
    // Find exit to target room
    var remoteControllerFlag;
    if (this.memory.currentFlag == undefined) {
        remoteControllerFlag = Game.flags[this.findMyFlag("remoteController")];
    }
    else {
        remoteControllerFlag = Game.flags[this.memory.currentFlag];
    }

    if (remoteControllerFlag != undefined) {
        this.memory.currentFlag = remoteControllerFlag.name;
    }

    if (remoteControllerFlag != undefined && this.room.name != remoteControllerFlag.pos.roomName) {
        //still in wrong room, go out
        this.gotoFlag(remoteControllerFlag);
    }
    else if (remoteControllerFlag != undefined) {
        //new room reached, start reserving / claiming
        var returncode;

        if (this.room.memory.hostiles.length == 0) {
            // try to claim the controller
            if (this.room.controller.owner == undefined) {
                if (remoteControllerFlag.memory.claim == 1) {
                    returncode = this.claimController(this.room.controller);
                }
                else {
                    returncode = this.reserveController(this.room.controller);
                }
            }
            else {
                this.moveTo(this.room.controller, {reusePath: moveReusePath()});
            }

            if (returncode == ERR_NOT_IN_RANGE) {
                this.moveTo(this.room.controller, {reusePath: moveReusePath()});
            }

            if (this.room.controller.owner != undefined && this.room.controller.owner.username == playerUsername) {
                //Roomed successfully claimed, now build spawn and remove spawns and extensions from previous owner
                var spawns = creep.room.find(FIND_MY_SPAWNS).length;
                if (spawns == 0) {

                    var spawnConstructionsites = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN)}).length;
                    if (spawnConstructionsites == 0) {

                        remoteControllerFlag.pos.createConstructionSite(STRUCTURE_SPAWN);
                    }
                }

                var oldBuildings = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION});
                for (var b in oldBuildings) {
                    if (oldBuildings[b].isActive() == false) {
                        oldBuildings.destroy();
                    }
                }
            }
        }
        else {
            //Hostiles creeps in new room
            var homespawn = Game.getObjectById(this.memory.spawn);
            if (this.room.name != this.memory.homeroom) {
                this.moveTo(homespawn), {reusePath: moveReusePath()};
            }
            this.memory.fleeing = true;
        }
    }
};

/** STATIONARY HARVESTER **/
Creep.prototype.roleStationaryHarvester = function() {
    if (this.memory.statusHarvesting == undefined || this.memory.statusHarvesting == false || this.carry.energy == this.carryCapacity) {
        //Look for vacant source marked as narrowSource
        if (this.memory.currentFlag == undefined) {
            this.memory.currentFlag = this.findMyFlag("narrowSource");
        }

        if (this.memory.currentFlag == undefined) {
            console.log(this.name + " has no source to stationary harvest in room " + this.room.name + ".");
        }
        else {
            var flag = Game.flags[this.memory.currentFlag];
            if (this.pos.isEqualTo(flag)) {
                // Harvesting position reached
                if (this.carry.energy == this.carryCapacity) {
                    //Identify and save container
                    if (this.memory.narrowContainer == undefined) {
                        var container = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER && s.storeCapacity - _.sum(s.store) > 0) || (s.structureType == STRUCTURE_LINK && s.energyCapacity - s.energy) > 0});
                        if (container != null) {
                            this.memory.narrowContainer = container.id;
                        }
                    }
                    else {
                        container = Game.getObjectById(this.memory.narrowContainer);
                    }
                    if (this.transfer(container, RESOURCE_ENERGY) != OK) {
                        delete this.memory.narrowContainer;
                    }
                }

                if (this.carry.energy < this.carryCapacity) {
                    //Time to refill
                    //Identify and save source
                    if (this.memory.narrowSource == undefined) {
                        var source = this.pos.findClosestByRange(FIND_SOURCES);
                        this.memory.narrowSource = source.id;
                    }
                    else {
                        var source = Game.getObjectById(this.memory.narrowSource);
                    }

                    if (source.energy == 0) {
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
            else if (flag != undefined) {
                // Move to harvesting point
                this.moveTo(flag, {reusePath:moveReusePath()});
            }
            else {
                console.log(this.name + " in room " + this.room.name + " has a problem.");
            }
        }
    }
    else {
        // Creep is harvesting, try to keep harvesting
        var result = this.harvest(Game.getObjectById(this.memory.statusHarvesting));
        if (result != OK) {
            this.memory.statusHarvesting = false;
        }
    }
};

/** MINER **/
Creep.prototype.roleMiner = function() {
    if (this.room.name != this.memory.homeroom) {
        //return to home room
        var hometarget = Game.getObjectById(this.memory.spawn);
        this.moveTo(hometarget, {reusePath: moveReusePath()});
    }
    else {
        if (this.memory.statusHarvesting != undefined && this.memory.statusHarvesting != false) {
            // Creep is mining, try to keep mining
            if (this.harvest(Game.getObjectById(this.memory.statusHarvesting)) != OK || _.sum(this.carry) == this.carryCapacity) {
                this.memory.statusHarvesting = false;
            }
        }
        else if (this.room.memory.roomArrayMinerals != undefined) {
            // if creep is bringing minerals to a structure but is empty now
            if (_.sum(this.carry) == 0) {
                // switch state to harvesting
                this.memory.working = false;
            }
            // if creep is harvesting minerals but is full
            else if (_.sum(this.carry) == this.carryCapacity || this.carry[RESOURCE_ENERGY] > 0) {
                // switch state
                this.memory.working = true;
            }
            var storage = this.room.storage;
            var resource;

            // if creep is supposed to transfer minerals to a structure
            if (this.memory.working == true) {
                if (this.carry[RESOURCE_ENERGY] > 0) {
                    //somehow picked up energy
                    if (this.room.storage == undefined) {
                        var container = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_LINK)
                    }
                    else {
                        var container = this.room.storage;
                    }

                    if (this.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.moveTo(container, {reusePath: moveReusePath()});
                    }
                }
                else {
                    for (var t in this.carry) {
                        if (t != "energy") {
                            resource = t;
                            break;
                        }
                    }
                    if (storage == null) {
                        //No storage found in room
                        var container = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
                        if (this.transfer(container, resource) == ERR_NOT_IN_RANGE) {
                            this.moveTo(container, {reusePath: moveReusePath()});
                        }
                    }
                    else {
                        //storage found
                        if (this.transfer(storage, resource) == ERR_NOT_IN_RANGE) {
                            this.moveTo(storage, {reusePath: moveReusePath()});
                        }
                    }
                }
            }
            else {
                //creep is supposed to harvest minerals from source or containers
                let container = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < _.sum(s.store)});
                var containerResource;

                if (container != undefined && storage != undefined) {
                    //minerals waiting in containers
                    //analyzing storage of container
                    var store = container.store;
                    for (var s in store) {
                        if (s != RESOURCE_ENERGY) {
                            // mineral found in container
                            containerResource = s;
                        }
                    }
                    if (this.withdraw(container, containerResource) != OK) {
                        this.moveTo(container);
                    }
                }
                else if (Game.getObjectById(this.room.memory.roomArrayMinerals[0]).mineralAmount > 0) {
                    //minerals waiting at source
                    var mineral = this.pos.findClosestByPath(FIND_MINERALS, {filter: (s) => s.mineralAmount > 0});
                    var result = this.harvest(mineral);
                    if (mineral != null && result == ERR_NOT_IN_RANGE) {
                        this.moveTo(mineral);
                        this.memory.statusHarvesting = false;
                    }
                    else if (mineral != null && result == OK) {
                        this.memory.statusHarvesting = mineral.id;
                    }
                    else if (mineral != null && result == ERR_TIRED) {
                        this.memory.sleep = 3;
                    }
                    else {
                        this.memory.statusHarvesting = false;
                    }
                }
            }
        }
    }
};

/** DISTRIBUTOR **/
Creep.prototype.roleDistributor = function() {
    var nuker = Game.getObjectById(this.room.memory.roomArrayNukers[0]);

    if (this.room.memory.terminalTransfer != undefined) {
        //ongoing terminal transfer
        if (_.sum(this.carry) > 0) {
            //Creep full
            if (this.pos.getRangeTo(this.room.terminal) > 1) {
                this.moveTo(this.room.terminal, {reusePath: moveReusePath()});
            }
            else {
                // Dump everything into terminal
                for (var res in this.carry) {
                    this.transfer(this.room.terminal, res);
                }
            }
        }
        else {
            //Creep empty
            var transferAmount;
            var targetRoom;
            var transferResource;
            var energyCost;
            var packageVolume;
            var info = this.room.memory.terminalTransfer; // Format: ROOM:AMOUNT:RESOURCE:COMMENT W21S38:100:Z:TestTransfer
            info = info.split(":");
            targetRoom = info[0];
            transferAmount = parseInt(info[1]);
            transferResource = info[2];
            if (transferAmount > this.carryCapacity) {
                packageVolume = this.carryCapacity;
            }
            else {
                packageVolume = transferAmount;
            }
            if (info[3] == "MarketOrder") {
                var order = Game.market.getOrderById(targetRoom);
                energyCost = Game.market.calcTransactionCost(packageVolume, this.room.name, order.roomName);
            }
            else {
                energyCost = Game.market.calcTransactionCost(packageVolume, this.room.name, targetRoom);
            }

            // Check resource status
            if (this.room.terminal.store[transferResource] >= packageVolume) {
                //Check for energy level
                if ((transferResource != RESOURCE_ENERGY && this.room.terminal.store[RESOURCE_ENERGY] < energyCost + packageVolume)
                    || transferResource == RESOURCE_ENERGY && this.room.terminal.store[RESOURCE_ENERGY] - transferAmount < energyCost) {
                    //Get energy
                    if (energyCost > this.carryCapacity) {
                        energyCost = this.carryCapacity;
                    }
                    if(this.withdraw(this.room.storage, RESOURCE_ENERGY, energyCost) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                    }
                }
                else if (this.room.terminal.store[transferResource] < packageVolume) {
                    // Get transfer resource
                    if(this.withdraw(this.room.storage, transferResource, packageVolume) == ERR_NOT_IN_RANGE) {
                        this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                    }
                }
            }
            else {
                // Get transfer resource
                if(this.withdraw(this.room.storage, transferResource, packageVolume) == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                }
            }
        }
    }
    else if (this.checkTerminalLimits(RESOURCE_GHODIUM).amount == 0 && this.room.memory.terminalTransfer == undefined && nuker != undefined
        && nuker.ghodium < nuker.ghodiumCapacity && (this.room.storage.store[RESOURCE_GHODIUM] != undefined || this.carry[RESOURCE_GHODIUM] != undefined)) {
        //Nuker in need of Ghodium and storage has enough of it
        if (this.storeAllBut(RESOURCE_GHODIUM) == true) {
            if (_.sum(this.carry) < this.carryCapacity && this.room.storage.store[RESOURCE_GHODIUM] > 0) {
                if (this.withdraw(this.room.storage, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                    this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                }
            }
            else {
                if (this.transfer(nuker, RESOURCE_GHODIUM) == ERR_NOT_IN_RANGE) {
                    this.moveTo(nuker, {reusePath: moveReusePath()});
                }
            }
        }
    }
    else {
        //Nothing special going on check for terminal levels
        var terminalDelta;
        if (this.room.memory.terminalDelta == undefined || Game.time % 10 == 0 || this.room.memory.terminalDelta != 0) {
            terminalDelta = 0;
            for (var res in this.room.terminal.store) {
                delta = this.checkTerminalLimits(res);
                terminalDelta += Math.abs(delta.amount);
            }

            for (var res in this.room.storage.store) {
                delta = this.checkTerminalLimits(res);
                terminalDelta += Math.abs(delta.amount);
            }
        }
        else {
            terminalDelta = this.room.memory.terminalDelta;
        }


        if (terminalDelta == 0) {
            //Everything perfect!
            if (this.storeAllBut(RESOURCE_ENERGY) == true) {
                this.roleEnergyTransporter();
            }
        }
        else {
            if (_.sum(this.carry) > 0) {
                //Creep full
                var terminalResources = [];
                for (var res in this.carry) {
                    delta = this.checkTerminalLimits(res);
                    if (delta.amount < 0 && this.carry[res] > 0) {
                        //Terminal needs material
                        var load = Math.abs(delta.amount);
                        if (load > this.carry[res]) {
                            load = this.carry[res];
                        }
                        if (this.transfer(this.room.terminal, res, load) == ERR_NOT_IN_RANGE) {
                            this.moveTo(this.room.terminal);
                        }
                        terminalResources.push(res);
                        break;
                    }
                }
                if (terminalResources.length == 0) {
                    // Material for storage left in creep
                    this.storeAllBut();
                }
            }
            else {
                // Creep empty
                //Check storage for useful resources
                terminalDelta = 0;
                for (var res in this.room.terminal.store) {
                    var delta = this.checkTerminalLimits(res);
                    if (delta.amount > 0) {
                        //Terminal has surplus material
                        var load = Math.abs(delta.amount);
                        if (load > this.carryCapacity) {
                            load = this.carryCapacity;
                        }
                        if (this.withdraw(this.room.terminal, res, load) == ERR_NOT_IN_RANGE) {
                            this.moveTo(this.room.terminal);
                        }
                        terminalDelta++;
                        break;
                    }
                }

                if (terminalDelta == 0) {
                    //Check for surplus material in terminal
                    var breaker = false;
                    for (var res in this.room.storage.store) {
                        delta = this.checkTerminalLimits(res);
                        if (delta.amount < 0) {
                            //Terminal needs material from storage
                            var load = Math.abs(delta.amount);
                            if (load > this.carryCapacity) {
                                load = this.carryCapacity;
                            }

                            if (this.withdraw(this.room.storage, res, load) == ERR_NOT_IN_RANGE) {
                                this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                            }
                            breaker = true;
                            break;
                        }
                    }


                    if (breaker == false && _.sum(this.carry) == 0) {
                        //Look for minerals in containers
                        let container;
                        if (this.memory.myMineralContainer == undefined) {
                            container = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < _.sum(s.store)});
                            if (container != null) {
                                this.memory.myMineralContainer = container.id;
                            }
                        }
                        else {
                            container = Game.getObjectById(this.memory.myMineralContainer);
                            if (_.sum(container.store) == container.store[RESOURCE_ENERGY]) {
                                delete this.memory.myMineralContainer;
                                container = null;
                            }
                        }

                        var containerResource = undefined;

                        if (container != undefined && container != null && this.room.storage != undefined) {
                            //minerals waiting in containers
                            //analyzing storage of container
                            var store = container.store;
                            for (var s in store) {
                                if (s != RESOURCE_ENERGY) {
                                    // mineral found in container
                                    containerResource = s;
                                }
                            }
                            if (containerResource != undefined && this.withdraw(container, containerResource) == ERR_NOT_IN_RANGE) {
                                this.moveTo(container, {reusePath: moveReusePath()});
                            }
                        }
                    }
                }
            }
        }
    }
};

/** ENERGY TRANSPORTER **/
Creep.prototype.roleEnergyTransporter = function() {
    if (this.getRidOfMinerals() == false) {
        // if creep is bringing energy to a structure but has no energy left
        if (this.carry.energy == 0) {
            if (this.memory.working == true) {
                delete this.memory.targetBuffer;
            }
            // switch state to harvesting
            this.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (_.sum(this.carry) == this.carryCapacity) {
            if (this.memory.working == false) {
                delete this.memory.targetBuffer;
            }
            // switch state
            this.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (this.memory.working == true) {
            this.roleHarvester();
        }
        // if creep is supposed to harvest energy from source
        else {
            this.roleCollector();
        }
    }
};

/** DEMOLISHER **/
Creep.prototype.roleDemolisher = function() {
    var demolishFlag = _.filter(Game.flags,{ memory: { function: 'demolish', spawn: this.memory.spawn}});
    // if creep is bringing energy to a structure but has no energy left
    if (this.room.memory.hostiles.length > 0) {
        var homespawn = Game.getObjectById(this.memory.spawn);
        if (this.room.name != this.memory.homeroom) {
            this.moveTo(homespawn), {reusePath: moveReusePath()};
        }
        else if (this.pos.getRangeTo(homespawn) > 5) {
            this.moveTo(homespawn), {reusePath: moveReusePath()};
        }
        this.memory.fleeing = true;
        return;
    }

    if (this.carry.energy == 0) {
        // switch state to demolishing
        this.memory.working = false;
    }
    else if (this.carry.energy == this.carryCapacity) {
        // if creep is demolishing but is full
        demolishFlag = _.filter(Game.flags,{ memory: { function: 'demolish', spawn: this.memory.spawn}});
        if (demolishFlag.length > 0) {
            demolishFlag = demolishFlag[0];
            if (demolishFlag.memory.dropEnergy == true) {
                this.drop(RESOURCE_ENERGY);
                this.memory.dropEnergy = true;
            }
            else {
                this.memory.working = true;
                delete this.memory.path;
            }
        }
    }

    // if creep is supposed to transfer energy to a structure
    if (this.memory.working == true) {
        // Find exit to spawn room
        var spawn = Game.getObjectById(this.memory.spawn);
        if (this.room.name != this.memory.homeroom) {
            //still in new room, go out
            if(!this.memory.path) {
                this.memory.path = this.pos.findPathTo(spawn);
            }
            if(this.moveByPath(this.memory.path) == ERR_NOT_FOUND) {
                this.memory.path = this.pos.findPathTo(spawn);
                this.moveByPath(this.memory.path);
            }
        } //TODO: Check demolishFlag.pos
        else if (demolishFlag.pos != undefined) {
            // back in spawn room
            let structure;
            if (demolishFlag.pos.roomName == this.memory.homeroom) {
                //Demolisher flag is in creep's home room -> energy will only be stored in containers and in the storage
                structure = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) && s.storeCapacity > _.sum(s.store) && s.pos.isEqualTo(demolishFlag.pos) == false});
            }
            else {
                structure = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_LINK, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_SPAWN);
            }

            if (structure != null) {
                // try to transfer energy, if it is not in range
                if (this.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(structure, {reusePath: moveReusePath()});
                }
            }
        }
    }
    // if creep is supposed to demolish
    else {
        //TODO Several demolishers per spawn; use creep.findMyFlag()
        //Find something to demolish

        demolishFlag = _.filter(Game.flags,{ memory: { function: 'demolish', spawn: this.memory.spawn}});
        if (demolishFlag.length > 0) {
            // Find exit to target room
            demolishFlag = demolishFlag[0];

            if (this.room.name != demolishFlag.pos.roomName) {
                //still in old room, go out
                if (this.moveTo(demolishFlag, {reusePath: moveReusePath()}) == ERR_NO_PATH) {
                    delete this.memory._move;
                    delete this.memory.path;
                }
                this.memory.oldRoom = true;
            }

            if (this.room.name == demolishFlag.pos.roomName) {
                if (this.room.memory.hostiles.length == 0) {
                    if (this.memory.statusDemolishing == undefined) {
                        //new room reached, start demolishing
                        if (this.memory.oldRoom == true) {
                            delete this.memory.targetBuffer;
                            delete this.memory.oldRoom;
                            delete this.memory._move;
                            delete this.memory.path;
                        }
                        var targetlist;

                        if (demolishFlag.memory.target == "object") {
                            //demolish flag position structures
                            targetlist = demolishFlag.pos.lookFor(LOOK_STRUCTURES);
                            // Go through target list
                            for (var i in targetlist) {
                                if (targetlist[i].structureType != undefined) {
                                    if ((targetlist[i].store != undefined && targetlist[i].store[RESOURCE_ENERGY] > 0) || (targetlist[i].energy != undefined && targetlist[i].energy > 0)) {
                                        //empty structure of energy first
                                        if (this.withdraw(targetlist[i], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                            this.moveTo(targetlist[i], {reusePath: moveReusePath()});
                                        }
                                    }
                                    else if (this.dismantle(targetlist[i]) == ERR_NOT_IN_RANGE) {
                                        this.moveTo(targetlist[i], {reusePath: moveReusePath()});
                                    }
                                    break;
                                }
                            }
                            if (targetlist.length == 0) {
                                Game.notify("Demolition flag in room " + demolishFlag.pos.roomName + " is placed in empty square!")
                            }
                        }
                        else if (demolishFlag.memory.target == "room") {
                            //demolish all structures in room
                            // find structures with energy
                            var target = this.findResource(RESOURCE_ENERGY, STRUCTURE_SPAWN, STRUCTURE_EXTENSION, STRUCTURE_TERMINAL, STRUCTURE_STORAGE, STRUCTURE_TOWER, STRUCTURE_LINK, STRUCTURE_LAB);
                            if (target == null) {
                                target = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_CONTAINER && s.structureType != STRUCTURE_CONTROLLER});
                            }
                            if (target == null) {
                                target = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType != STRUCTURE_ROAD && s.structureType != STRUCTURE_CONTAINER && s.structureType != STRUCTURE_CONTROLLER});
                            }
                            if (target != null) {
                                if ((target.store != undefined && target.store[RESOURCE_ENERGY] > 0) || target.energy != undefined && target.energy > 20) {
                                    //empty structure of energy first
                                    if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        this.moveTo(target, {reusePath: moveReusePath()});
                                    }
                                    else if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        this.moveTo(target, {reusePath: moveReusePath()});
                                    }
                                }
                                else {
                                    var result = this.dismantle(target);
                                    if (result == ERR_NOT_IN_RANGE) {
                                        this.moveTo(target, {reusePath: moveReusePath()});
                                    }
                                    else if (result == OK) {
                                        this.memory.statusDemolishing = target.id;
                                    }
                                }
                            }
                        }
                    }
                    else {
                        if (this.dismantle(Game.getObjectById(this.memory.statusDemolishing)) != OK) {
                            delete this.memory.statusDemolishing;
                            delete this.memory.path;
                            delete this.memory._move;
                            delete this.memory.targetBuffer;
                        }
                    }
                }
                else {
                    //Hostiles creeps in new room
                    this.memory.fleeing = true;
                    this.goToHomeRoom();
                }
            }
        }
        else {
            this.roleHarvester();
        }
    }
};

/** ENERGY HAULER **/
Creep.prototype.roleEnergyHauler = function() {
    var roleCollector = require('role.collector');
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

/** REMOTE STATIONARY HARVESTER **/
Creep.prototype.roleRemoteStationaryHarvester = function() {
    if (this.memory.statusHarvesting == undefined || this.memory.statusHarvesting == false || this.carry.energy == this.carryCapacity || Game.time % 7 == 0) {
        if (this.memory.currentFlag == undefined) {
            this.memory.currentFlag = this.findMyFlag("haulEnergy");
        }

        if (this.memory.currentFlag == undefined) {
            console.log(this.name + " has no sources to stationary harvest in room " + this.room.name + ".");
        }
        else if (this.room.memory.hostiles.length == 0) {
            var flag = Game.flags[this.memory.currentFlag];
            var sourceKeeper = [];

            if (flag != undefined) {
                if (flag.pos.roomName != this.room.name) {
                    // Creep not in assigned room
                    this.moveTo(flag, {reusePath: moveReusePath()});
                }
                else if (this.pos.isEqualTo(flag) == true) {
                    // Harvesting position reached
                    if (this.carry.energy > 0 && sourceKeeper.length == 0) {
                        //Identify and save container
                        var buildContainers = this.pos.findInRange(FIND_CONSTRUCTION_SITES, 0, {filter: (s) => s.structureType == STRUCTURE_CONTAINER});
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
                                var constructionSites =  this.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: (s) => (s.structureType == STRUCTURE_CONTAINER)});
                                if (containers.length == 0 && constructionSites.length == 0 && this.pos.isEqualTo(flag) == true) {
                                    this.pos.createConstructionSite(STRUCTURE_CONTAINER);
                                }
                            }
                        }
                    }
                    else if (this.carry.energy < this.carryCapacity) {
                        //Time to refill
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
                else if (sourceKeeper.length == 0) {
                    // Move to harvesting point
                    this.moveTo(flag, {reusePath: moveReusePath()});
                }
            }
            else {
                console.log(this.name + " in room " + this.room.name + " has a problem.");
            }
        }
        else {
            // Hostiles present
            this.memory.fleeing = true;
            this.goToHomeRoom();
        }
    }
    else {
        // Creep is harvesting, try to keep harvesting
        var source = Game.getObjectById(this.memory.statusHarvesting);
        if (this.harvest(source) != OK || this.carry.energy == this.carryCapacity) {
            this.memory.statusHarvesting = false;
        }
    }
};

/** GROUP UNIT **/
Creep.prototype.roleUnit = function() {
    var strategies = require('strategies');
    var group = this.findMyFlag("unitGroup");
    var groupFlag = _.filter(Game.flags,{ name: group})[0];

    if (this.memory.strategy == true && groupFlag != undefined && groupFlag.memory.strategy != undefined && this.room.name == groupFlag.pos.roomName) {
        strategies.run(this, groupFlag);
    }
    else if (groupFlag != undefined) {
        if (this.room.name == groupFlag.pos.roomName) {
            //Arrived in target room, execute strategy
            this.memory.strategy = true;
            strategies.run(this, groupFlag);
        }
        else {
            // Creep still on route, attack within 4 range
            this.memory.strategy = false;
            if (this.room.memory.hostiles.length > 0) {
                //Enemy creeps around
                let nearTargets = this.pos.findInRange(FIND_HOSTILE_CREEPS, 4, function (c) { return isHostile(c)});
                if (nearTargets.length > 0) {
                    let target = this.pos.findClosestByPath(nearTargets);
                    if (this.attack(target) == ERR_NOT_IN_RANGE) {
                        this.moveTo(target);
                    }
                }
            }
            else {
                this.gotoFlag(groupFlag);
            }
        }
    }
    else {
        //No flag for creep anymore -> go home
        delete this.memory.currentFlag;
        delete this.memory.strategy;
        if (this.goToHomeRoom() == true) {
            var range = this.pos.getRangeTo(this.room.controller);
            if (range > 1) {
                this.moveTo(this.room.controller, {reusePath: moveReusePath()});
            }
        }
    }
};

/** SCIENTIST **/
Creep.prototype.roleScientist = function() {
    if (Game.cpu.bucket > CPU_THRESHOLD) {
        if (this.ticksToLive < 50 && _.sum(this.carry) == 0) {
            //Scientist will die soon and possibly drop precious material
            let spawn = Game.getObjectById(this.memory.spawn);
            if (spawn.recycleCreep(this) == ERR_NOT_IN_RANGE) {
                this.moveTo(spawn, {reusePath: moveReusePath()});
            }
        }
        else {
            if (this.room.memory.labOrder != undefined && this.room.memory.innerLabs != undefined) {
                // Ongoing labOrder with defined innerLabs
                var labOrder = this.room.memory.labOrder.split(":");
                var amount = labOrder[0];
                var innerLabs = this.room.memory.innerLabs;
                var status = labOrder[3];

                if (innerLabs.length != 2) {
                    return "Not enough inner labs found!";
                }
                switch (status) {
                    case "prepare":
                        var labs = [];
                        var labsReady = 0;
                        labs.push(Game.getObjectById(innerLabs[0].labID));
                        labs.push(Game.getObjectById(innerLabs[1].labID));

                        for (var lb in labs) {
                            //Checking inner labs
                            var currentInnerLab = labs[lb];
                            if (currentInnerLab.mineralType != innerLabs[lb].resource || (currentInnerLab.mineralType == innerLabs[lb].resource && (currentInnerLab.mineralAmount < currentInnerLab.mineralCapacity && currentInnerLab.mineralAmount < amount))) {
                                //Lab has to be prepared
                                if (currentInnerLab.mineralType == undefined || currentInnerLab.mineralType == innerLabs[lb].resource) {
                                    //Lab needs minerals
                                    if (this.storeAllBut(innerLabs[lb].resource) == true) {
                                        if (_.sum(this.carry) == 0) {
                                            //Get minerals from storage
                                            var creepPackage = amount - currentInnerLab.mineralAmount;
                                            if (creepPackage > this.carryCapacity) {
                                                creepPackage = this.carryCapacity;
                                            }

                                            if (this.withdraw(this.room.storage, innerLabs[lb].resource, creepPackage) == ERR_NOT_IN_RANGE) {
                                                this.moveTo(this.room.storage, {reusePath: moveReusePath()});
                                            }
                                        }
                                        else {
                                            if (this.transfer(currentInnerLab, innerLabs[lb].resource) == ERR_NOT_IN_RANGE) {
                                                this.moveTo(currentInnerLab, {reusePath: moveReusePath()});
                                            }
                                        }
                                    }
                                }
                                else {
                                    //Lab has to be emptied -> get rid of stuff in creep
                                    if (this.storeAllBut() == true) {
                                        //Get minerals from storage
                                        if (this.withdraw(currentInnerLab, currentInnerLab.mineralType) == ERR_NOT_IN_RANGE) {
                                            this.moveTo(currentInnerLab, {reusePath: moveReusePath()});
                                        }
                                    }
                                }
                                break;
                            }

                            if (currentInnerLab.mineralType == innerLabs[lb].resource && (currentInnerLab.mineralAmount == currentInnerLab.mineralCapacity || currentInnerLab.mineralAmount >= amount)) {
                                labsReady++;
                            }
                        }

                        if (labsReady == 2) {
                            this.say(
                                "Waiting ...");
                        }
                        break;

                    case "done":
                        //Empty all labs to storage
                        var emptylabs = 0;
                        var lab;
                        for (var c in this.room.memory.roomArrayLabs) {
                            lab = Game.getObjectById(this.room.memory.roomArrayLabs[c]);
                            if ((this.room.memory.boostLabs == undefined || this.room.memory.boostLabs.indexOf(lab.id) == -1) && lab.mineralAmount > 0 && lab.id != innerLabs[0].labID && lab.id != innerLabs[1].labID) {
                                {
                                    if (_.sum(this.carry) < this.carryCapacity) {
                                        if (this.withdraw(lab, lab.mineralType) == ERR_NOT_IN_RANGE) {
                                            this.moveTo(lab, {reusePath: moveReusePath()});
                                        }
                                    }
                                    else {
                                        this.storeAllBut();
                                    }
                                }
                            }
                            else if ((this.room.memory.boostLabs == undefined || this.room.memory.boostLabs.indexOf(lab.id) == -1) && lab.energy > 0)
                            {
                                if (_.sum(this.carry) < this.carryCapacity) {
                                    if (this.withdraw(lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                        this.moveTo(lab, {reusePath: moveReusePath()});
                                    }
                                }
                                else {
                                    this.storeAllBut();
                                }
                            }
                            else {
                                emptylabs++;
                            }
                        }
                        if (emptylabs == this.room.memory.roomArrayLabs.length && lab != undefined) {
                            if (amount <= lab.mineralCapacity) {
                                if (this.storeAllBut() == true) {
                                    delete this.room.memory.labOrder;
                                }
                            }
                            else {
                                // Restart process to do more of the same
                                amount -= lab.mineralCapacity;
                                labOrder[0] = amount;
                                labOrder[3] = "prepare";
                                this.room.memory.labOrder = labOrder.join(":");
                            }
                        }
                        break;

                    case "running":
                    default:
                        let mineralsContainers = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && (_.sum(s.store) > s.store[RESOURCE_ENERGY] || (_.sum(s.store) > 0 && s.store[RESOURCE_ENERGY == 0]))});
                        if (mineralsContainers.length == 0) {
                            delete this.memory.targetBuffer;
                            delete this.memory.resourceBuffer;
                            this.roleEnergyTransporter()
                        }
                        else {
                            //get minerals from container
                            if (this.memory.tidyFull == undefined && _.sum(this.carry) < this.carryCapacity) {
                                //creep not full
                                for (let e in mineralsContainers[0].store){
                                    if (e != "energy" && this.withdraw(mineralsContainers[0],e) == ERR_NOT_IN_RANGE) {
                                        this.moveTo(mineralsContainers[0],{reusePath: moveReusePath()});
                                    }
                                }
                            }
                            else {
                                //creep full
                                this.memory.tidyFull = true;
                                this.storeAllBut();
                                if (_.sum(this.carry) == 0) {
                                    delete this.memory.tidyFull;
                                }
                            }
                        }
                        break;
                }
            }
            else {
                //Empty all labs to storage
                var emptylabs = 0;
                var lab;
                for (var c in this.room.memory.roomArrayLabs) {
                    lab = Game.getObjectById(this.room.memory.roomArrayLabs[c]);
                    if (lab.mineralAmount > 0) {
                        if (this.storeAllBut() == true) {
                            if (this.withdraw(lab, lab.mineralType) == ERR_NOT_IN_RANGE) {
                                this.moveTo(lab, {reusePath: moveReusePath()});
                            }
                        }
                    }
                    else {
                        emptylabs++;
                    }
                }

                if (emptylabs == this.room.memory.roomArrayLabs.length) {
                    delete this.memory.targetBuffer;
                    delete this.memory.resourceBuffer;
                    this.roleEnergyTransporter();
                }
            }
        }
    }
};

/** BIG CLAIMER **/
Creep.prototype.roleBigClaimer = function() {
    // Find exit to target room
    var targetControllers = _.filter(Game.flags,{ memory: { function: 'attackController', spawn: this.memory.spawn}});
    var targetController;
    var busyCreeps;
    if (this.memory.attackControllerFlag != undefined) {
        //Check whether claiming this flag is this OK
        busyCreeps = _.filter(Game.creeps,{ memory: { remoteControllerFlag: this.memory.attackControllerFlag, spawn: this.memory.spawn}});
    }

    if (this.memory.attackControllerFlag == undefined || (this.memory.attackControllerFlag != undefined && busyCreeps.length != 1)) {
        //Flag taken, choose other flag
        for (var rem in targetControllers) {
            //Look for unoccupied targetController
            var flagName = targetControllers[rem].name;

            this.memory.attackControllerFlag = targetControllers[rem].name;
            busyCreeps = _.filter(Game.creeps,{ memory: { attackControllerFlag: flagName, spawn: this.memory.spawn}});

            if (busyCreeps.length <= targetControllers[rem].memory.volume) {
                //No other claimer working on this flag
                targetController = targetControllers[rem];
                this.memory.attackControllerFlag = targetController.name;
                break;
            }
        }
    }
    else {
        //Load previous flag
        targetControllers = _.filter(Game.flags,{name: this.memory.attackControllerFlag});
        targetController = targetControllers[0];
    }

    if (targetController != undefined && this.room.name != targetController.pos.roomName) {
        //still in wrong room, go out
        if (!this.memory.path) {
            this.memory.path = this.pos.findPathTo(targetController);
        }
        if (this.moveByPath(this.memory.path) == ERR_NOT_FOUND) {
            this.memory.path = this.pos.findPathTo(targetController);
            this.moveByPath(this.memory.path)
        }
    }
    else if (targetController != undefined) {
        //new room reached, start reserving / claiming
        var returncode;
        // try to claim the controller
        if (this.room.controller.owner == undefined) {
            if (targetController.memory.claim == 1) {
                returncode = this.claimController(this.room.controller);
            }
            else {
                returncode = this.reserveController(this.room.controller);
            }
        }
        else {
            returncode = this.attackController(this.room.controller);
        }
        if (returncode == ERR_NOT_IN_RANGE) {
            this.moveTo(this.room.controller, {reusePath: moveReusePath()});
        }
        if (this.room.controller.owner != undefined && this.room.controller.owner.username == playerUsername) {
            //Roomed successfully claimed, now build spawn and remove spawns and extensions from previous owner
            var spawns = creep.room.find(FIND_MY_SPAWNS).length;
            if (spawns == 0) {
                var spawnConstructionsites = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (s) => (s.structureType == STRUCTURE_SPAWN)}).length;
                if (spawnConstructionsites == 0) {
                    targetController.pos.createConstructionSite(STRUCTURE_SPAWN);
                }
            }
            var oldBuildings = this.room.find(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION});
            for (var b in oldBuildings) {
                if (oldBuildings[b].isActive() == false) {
                    oldBuildings.destroy();
                }
            }
        }
    }
};

/** TRANSPORTER **/
Creep.prototype.roleTransporter = function () {
    //Find flag
    var flagName = this.findMyFlag("transporter");
    var destinationFlag = _.filter(Game.flags,{ name: flagName})[0];
    if (destinationFlag != null) {
        if (_.sum(this.carry) == 0) {
            this.memory.empty = true;
        }
        if (_.sum(this.carry) == this.carryCapacity) {
            this.memory.empty = false;
        }

        var resource = destinationFlag.memory.resource;
        if (this.memory.empty == true) {
            // Transporter empty
            if (this.memory.targetContainer != undefined) {
                delete this.memory.targetContainer;
            }

            if (this.goToHomeRoom() == true) {
                //Transporter at home
                var originContainer = this.findResource(resource, STRUCTURE_STORAGE, STRUCTURE_CONTAINER, STRUCTURE_LINK);
                if (originContainer != null && this.withdraw(originContainer, resource) == ERR_NOT_IN_RANGE) {
                    this.moveTo(originContainer, {reusePath: moveReusePath()});
                }
            }
        }
        else {
            if (this.room.name == destinationFlag.pos.roomName) {
                //Creep in destination room
                var targetContainer;
                if (this.memory.targetContainer == undefined || Game.time % 8 == 0) {
                    if (this.room.controller.owner != undefined && this.room.controller.owner.username == playerUsername) {
                        targetContainer = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_STORAGE);
                    }
                    else {
                        targetContainer = this.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && _.sum(s.store) < s.storeCapacity});
                    }

                    this.memory.targetContainer = targetContainer.id;
                }
                else {
                    targetContainer = Game.getObjectById(this.memory.targetContainer);
                }

                if (targetContainer != null && this.transfer(targetContainer, resource) == ERR_NOT_IN_RANGE) {
                    this.moveTo(targetContainer, {reusePath: moveReusePath()});
                }
            }
            else {
                this.moveTo(destinationFlag, {reusePath: moveReusePath()})
            }
        }
    }
};

/** SK HARVESTER **/
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

/** SK HAULER **/
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
Creep.prototype.roleBuilder = function () {
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
                        constructionSite = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType != STRUCTURE_RAMPART});
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
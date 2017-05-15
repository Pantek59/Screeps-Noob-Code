Creep.prototype.roleRepairer = function() {
    // check for home room
    if (this.room.name != this.memory.homeroom && this.memory.role != "remoteHarvester") {
        this.goToHomeRoom();
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
                else if (this.room.memory.roomArray.spawns.length > 0) {
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
                    var constructionSite = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
                    if (constructionSite == null) {
                        constructionSite = this.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {filter: (s) => s.structureType == STRUCTURE_ROAD});
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
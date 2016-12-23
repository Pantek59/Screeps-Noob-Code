module.exports = function() {

    StructureSpawn.prototype.getBodyInfo =
    function (roleName, energy) {
        var bodyInfo = {};
        bodyInfo.role = roleName;

        let rcl = this.room.controller.level;
        if (buildingPlans[roleName] == undefined) {
            console.log("No building plans for " + roleName + " found!");
        }
        else if (buildingPlans[roleName][rcl - 1].minEnergy > energy && rcl > 1) {
            if (buildingPlans[roleName][rcl - 2].minEnergy > energy) {
                return null;
            }
            else {
                return buildingPlans[roleName][rcl - 2].body;
            }
        }
        else {
            return buildingPlans[roleName][rcl - 1].body;
        }
    };

    StructureSpawn.prototype.createCustomCreep = function (energyCapacity, roleName, spawnID, vacantClaimerFlags) {
        //Check for boost
        var boost = [];
        for (let l in this.room.memory.boostList) {
            if (this.room.memory.boostList[l].role == roleName) {
                //Creep should get boost entry
                let boostEntry = this.room.memory.boostList[l];
                boost.push(boostEntry.mineralType);
                if (parseInt(boostEntry.volume) >= 0) {
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
        let body = this.getBodyInfo(roleName, this.room.energyCapacityAvailable);

        if (roleName == "miniharvester") {
            roleName = "harvester";
        }

        if (body != null && this.canCreateCreep(body) == OK) {
            if (roleName != "claimer") {
                return this.createCreep(body, undefined, {
                    role: roleName,
                    working: false,
                    spawn: spawnID,
                    jobQueueTask: undefined,
                    homeroom: this.room.name,
                    boostList: boost
                });
            }
            else {
                return this.createCreep(body, undefined, {
                    role: roleName,
                    working: false,
                    spawn: spawnID,
                    jobQueueTask: undefined,
                    homeroom: this.room.name,
                    boostList: boost,
                    currentFlag: vacantClaimerFlags[0].name
                });
            }
        }
    };
};
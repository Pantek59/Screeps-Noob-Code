require ("globals");

module.exports = {
    // state working = Returning minerals to structure
    run: function(creep) {
         if (creep.memory.statusHarvesting != undefined && creep.memory.statusHarvesting != false) {
             // Creep is mining, try to keep mining
             if (creep.harvest(Game.getObjectById(creep.memory.statusHarvesting)) != OK || _.sum(creep.carry) == creep.carryCapacity) {
                 creep.memory.statusHarvesting = false;
             }
         }
         else {
             // if creep is bringing minerals to a structure but is empty now
             if (_.sum(creep.carry) == 0) {
                 // switch state to harvesting
                 creep.memory.working = false;
             }
             // if creep is harvesting minerals but is full
             else if (_.sum(creep.carry) == creep.carryCapacity || creep.carry[RESOURCE_ENERGY] > 0) {
                 // switch state
                 creep.memory.working = true;
             }
             var storage = creep.room.storage;
             var resource;

             // if creep is supposed to transfer minerals to a structure
             if (creep.memory.working == true) {
                 if (creep.carry[RESOURCE_ENERGY] > 0) {
                     //somehow picked up energy
                     if (creep.room.storage == undefined) {
                         var container = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER, STRUCTURE_LINK)
                     }
                     else {
                         var container = creep.room.storage;
                     }

                     if (creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                         creep.moveTo(container, {reusePath: DELAYPATHFINDING});
                     }
                 }
                 else {
                     for (var t in creep.carry) {
                         if (t != "energy") {
                             resource = t;
                             break;
                         }
                     }
                     if (storage == null) {
                         //No storage found in room
                         var container = creep.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
                         if (creep.transfer(container, resource) == ERR_NOT_IN_RANGE) {
                             creep.moveTo(container, {reusePath: DELAYPATHFINDING});
                         }
                     }
                     else {
                         //storage found
                         if (creep.transfer(storage, resource) == ERR_NOT_IN_RANGE) {
                             creep.moveTo(storage, {reusePath: DELAYPATHFINDING});
                         }
                     }
                 }
             }
             else {
                 //creep is supposed to harvest minerals from source or containers
                 var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] < _.sum(s.store)});
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
                     if (creep.withdraw (container, containerResource) != OK) {
                         creep.moveTo(container);
                     }
                 }
                 else if (Game.getObjectById(creep.room.memory.roomArrayMinerals[0]).mineralAmount > 0) {
                     //minerals waiting at source
                     var mineral = creep.pos.findClosestByPath(FIND_MINERALS, {filter: (s) => s.mineralAmount > 0});
                     var result = creep.harvest(mineral);
                     if (mineral != null && result == ERR_NOT_IN_RANGE) {
                         creep.moveTo(mineral);
                         creep.memory.statusHarvesting = false;
                     }
                     else if (mineral != null && (result == OK || result == ERR_TIRED)) {
                         creep.memory.statusHarvesting = mineral.id;
                     }
                     else {
                         creep.memory.statusHarvesting = false;
                     }
                 }
             }
         }
    }
};
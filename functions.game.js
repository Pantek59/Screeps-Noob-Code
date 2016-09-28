require ("globals");

global.terminalTransfer = function (transferResource, transferAmount, targetRoom, transferFlag) {
    // transfer resources to remote room from whatever room(s) is cheapest
    var roomCandidates = new Array();
    var tempArray = new Array();
    var resourceTotal = 0;

    if (arguments.length == 0) {
        return "terminalTransfer (transferResource, transferAmount, targetRoom, transferFlag) --> terminalTransfer(\"Z\", 10000, \"W16S47\", false)";
    }

    if (transferAmount < 100) {
        return "Minimal amount for terminal transfers are 100 units.";
    }

    for (var r in Game.rooms) {
        if (Game.rooms[r].terminal != undefined && Game.rooms[r].storage != undefined) {
            //Fill candidate array with rooms
            var roomResourceTotal = 0;
            var roomArray = new Array();

            // Add resource in storage
            if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.store[transferResource] != undefined) {
                roomResourceTotal += Game.rooms[r].storage.store[transferResource];
            }

            // Add resource in containers
            tempArray = Game.rooms[r].memory.roomArrayContainers;
            var container;
            for (var s in tempArray) {
                container = Game.getObjectById(tempArray[s]);
                if (container != undefined) {
                    if (container.store[transferResource] != undefined) {
                        roomResourceTotal += container.store[transferResource];
                    }
                }
            }

            if (transferResource == RESOURCE_ENERGY) {
                // Add resource in links
                tempArray = Game.rooms[r].memory.roomArrayLinks;
                for (var s in tempArray) {
                    container = Game.getObjectById(tempArray[s]);
                    if (container != undefined) {
                        roomResourceTotal += Game.getObjectById(tempArray[s]).energy;
                    }
                }
            }

            if (roomResourceTotal > 0 && Game.rooms[r].name != targetRoom) {
                roomArray["name"] = Game.rooms[r].name;
                roomArray["volume"] = roomResourceTotal;

                if (roomResourceTotal > transferAmount) {
                    roomArray["totalCost"] = Game.market.calcTransactionCost(transferAmount, Game.rooms[r].name, targetRoom);
                }
                else {
                    roomArray["totalCost"] = Game.market.calcTransactionCost(roomResourceTotal, Game.rooms[r].name, targetRoom);
                }
                roomArray["cost"] = Game.market.calcTransactionCost(100, roomArray.name, targetRoom);

                if (transferFlag == false) {
                    console.log(roomArray.name + ": " + roomResourceTotal + " of " + transferResource + " (energy factor: " + roomArray.cost + ")");
                }

                roomCandidates.push(roomArray);
                resourceTotal += roomResourceTotal;
            }
        }
    }

    var totalVolume = 0;
    var totalCost = 0;

    if (roomCandidates.length == 0) {
        return "No rooms with " + transferResource + " found.";
    }
    else if (resourceTotal < transferAmount) {
        return "Not enough " + transferResource + " found.";
    }
    else {
        // There are rooms holding enough of the transfer resource
        var candidatesByCost = _.sortBy(roomCandidates,"cost");

        for (var c in candidatesByCost) {
            if (Game.rooms[candidatesByCost[c].name].memory.terminalTransfer == undefined) {
                if (candidatesByCost[c].volume > transferAmount) {
                    if (transferFlag == false) {
                        console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoom + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
                    }
                    else if (transferFlag == true) {
                        Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoom + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer";
                        console.log(transferAmount + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoom + " for " + candidatesByCost[c].totalCost + " energy.");
                    }
                    totalVolume += transferAmount;
                    totalCost += candidatesByCost[c].totalCost;
                    break;
                }
                else {
                    if (transferFlag == false) {
                        console.log("Terminal Transfer Preview for room " + candidatesByCost[c].name + " // " + targetRoom + ":" + candidatesByCost[c].volume + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + candidatesByCost[c].totalCost);
                    }
                    else if (transferFlag == true) {
                        Game.rooms[candidatesByCost[c].name].memory.terminalTransfer = targetRoom + ":" + candidatesByCost[c].volume + ":" + transferResource + ":TerminalTransfer";
                        console.log(candidatesByCost[c].volume + " " + transferResource + " scheduled from room " + candidatesByCost[c].name + " to room " + targetRoom + " for " + candidatesByCost[c].totalCost + " energy.");
                    }
                    totalVolume += candidatesByCost[c].volume;
                    totalCost += candidatesByCost[c].totalCost;
                    transferAmount -= candidatesByCost[c].volume;
                }
            }
        }

        if (transferFlag == "cost") {
            return totalCost;
        }
        return "OK";
    }
};

global.terminalTransferX = function (transferResource, transferAmount, sourceRoomName, targetRoomName, transferFlag) {
    // transfer resources to from source to target
    var roomCandidates = new Array();
    var sourceRoom = Game.rooms[sourceRoomName];

    if (arguments.length == 0) {
        return "terminalTransferX (transferResource, transferAmount, sourceRoomName, targetRoomName, transferFlag) --> terminalTransfer(\"Z\", 10000, \"W18S49\", \"W16S47\", false)";
    }

    if (transferAmount < 100) {
        return "Minimal amount for terminal transfers are 100 units.";
    }

    if (sourceRoom.memory.terminalTransfer != undefined) {
        return "There is already an ongoing terminal transfer in room " + sourceRoomName + ".";
    }

    var totalCost = 0;
    if (sourceRoom.storage == undefined || sourceRoom.terminal == undefined || (sourceRoom.storage.store[transferResource] + sourceRoom.terminal.store[transferResource]) < transferAmount) {
        return "Error scheduling terminal transfer job.";
    }
    else {
        if (transferFlag == false) {
            console.log("Terminal Transfer Preview for room " + sourceRoom.name + " // " + targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer // Total Energy Cost: " + Game.market.calcTransactionCost(transferAmount, sourceRoomName, targetRoomName));
        }
        else if (transferFlag == true) {
            sourceRoom.memory.terminalTransfer = targetRoomName + ":" + transferAmount + ":" + transferResource + ":TerminalTransfer";
            console.log(transferAmount + " " + transferResource + " scheduled from room " + sourceRoomName + " to room " + targetRoomName + " for " + Game.market.calcTransactionCost(transferAmount, sourceRoomName, targetRoomName) + " energy.");
        }
        else {
            return "Transfer Flag missing.";
        }

        if (transferFlag == "cost") {
            return totalCost;
        }
        return "OK";
    }
};

global.listStorages = function (displayResource) {
    var returnstring = "<table><tr><th>Resource  </th>";
    var resourceTable = new Array();

    //Prepare header row
    for (var r in Game.rooms) {
        if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
            returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
            for (var res in Game.rooms[r].storage.store) {
                if (resourceTable.indexOf(res) == -1) {
                    resourceTable.push(res);
                }
            }
        }
    }
    returnstring = returnstring.concat("</tr>");
    for (res in resourceTable) {
        if (arguments.length == 0 || displayResource == resourceTable[res]) {
            returnstring = returnstring.concat("<tr></tr><td>" + resourceTable[res] + "  </td>");
            for (var r in Game.rooms) {
                if (Game.rooms[r].storage != undefined && Game.rooms[r].storage.owner.username == playerUsername) {
                    if (Game.rooms[r].storage.store[resourceTable[res]] == undefined) {
                        var amount = 0;
                    }
                    else {
                        var amount = Game.rooms[r].storage.store[resourceTable[res]];
                    }
                    returnstring = returnstring.concat("<td>" + prettyInt(amount) + "  </td>");
                }
            }
            returnstring = returnstring.concat("</tr>");
        }
    }
    returnstring = returnstring.concat("</tr></table>");
    return returnstring;
};

global.prettyInt = function (int) {
    var string = int.toString();
    var numbers = string.length;
    var rest = numbers % 3;
    var returnString = "";
    if (rest > 0) {
        returnString = string.substr(0, rest);
        if (numbers > 3) {
            returnString += "'";
        }
    }
    numbers -= rest;

    while (numbers > 0) {
        returnString += string.substr(rest,3);
        if (numbers > 3) {
            returnString += "'";
        }
        rest += 3;
        numbers -= 3;
    }
    return returnString;
};

global.listMiningLimits = function () {
    var returnstring = "<table><tr><th>Resource  </th>";
    var resourceTable = new Array();

    //Prepare header row
    for (var r in Game.rooms) {
        if (Game.rooms[r].storage != undefined) {
            returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
            for (var res in Game.rooms[r].storage.store) {
                if (resourceTable.indexOf(res) == -1) {
                    resourceTable.push(res);
                }
            }
        }
    }
    returnstring = returnstring.concat("</tr>");
    for (res in resourceTable) {
        returnstring = returnstring.concat("<tr></tr><td>" + resourceTable[res] + "  </td>");
        for (var r in Game.rooms) {
            if (Game.rooms[r].storage != undefined) {
                if (Game.rooms[r].storage.store[resourceTable[res]] == undefined) {
                    var amount = 0;
                }
                else {
                    var amount = Game.rooms[r].storage.store[resourceTable[res]];
                }
                returnstring = returnstring.concat("<td>" + prettyInt(Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxMining) + "  </td>");
            }
        }
        returnstring = returnstring.concat("</tr>");
    }
    returnstring = returnstring.concat("</tr></table>");
    return returnstring;
};

global.listTerminalLimits = function () {
    var returnstring = "<table><tr><th>Resource  </th>";
    var resourceTable = new Array();

    //Prepare header row
    for (var r in Game.rooms) {
        if (Game.rooms[r].storage != undefined) {
            returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
            for (var res in Game.rooms[r].storage.store) {
                if (resourceTable.indexOf(res) == -1) {
                    resourceTable.push(res);
                }
            }
        }
    }
    returnstring = returnstring.concat("</tr>");
    for (res in resourceTable) {
        returnstring = returnstring.concat("<tr></tr><td>" + resourceTable[res] + "  </td>");
        for (var r in Game.rooms) {
            if (Game.rooms[r].storage != undefined) {
                if (Game.rooms[r].storage.store[resourceTable[res]] == undefined) {
                    var amount = 0;
                }
                else {
                    var amount = Game.rooms[r].storage.store[resourceTable[res]];
                }
                returnstring = returnstring.concat("<td>" + prettyInt(Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxTerminal) + "  </td>");
            }
        }
        returnstring = returnstring.concat("</tr>");
    }
    returnstring = returnstring.concat("</tr></table>");
    return returnstring;
};

global.listLabLimits = function () {
    var returnstring = "<table><tr><th>Resource  </th>";
    var resourceTable = new Array();

    //Prepare header row
    for (var r in Game.rooms) {
        if (Game.rooms[r].storage != undefined) {
            returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
            for (var res in Game.rooms[r].storage.store) {
                if (resourceTable.indexOf(res) == -1) {
                    resourceTable.push(res);
                }
            }
        }
    }
    returnstring = returnstring.concat("</tr>");
    for (res in resourceTable) {
        returnstring = returnstring.concat("<tr></tr><td>" + resourceTable[res] + "  </td>");
        for (var r in Game.rooms) {
            if (Game.rooms[r].storage != undefined) {
                if (Game.rooms[r].storage.store[resourceTable[res]] == undefined) {
                    var amount = 0;
                }
                else {
                    var amount = Game.rooms[r].storage.store[resourceTable[res]];
                }
                returnstring = returnstring.concat("<td>" + prettyInt(Game.rooms[r].memory.resourceLimits[resourceTable[res]].maxLab) + "  </td>");
            }
        }
        returnstring = returnstring.concat("</tr>");
    }
    returnstring = returnstring.concat("</tr></table>");
    return returnstring;
};

global.listMarketLimits = function () {
    var returnstring = "<table><tr><th>Resource  </th>";
    var resourceTable = new Array();

    //Prepare header row
    for (var r in Game.rooms) {
        if (Game.rooms[r].storage != undefined) {
            returnstring = returnstring.concat("<th>" + Game.rooms[r].name + "  </th>");
            for (var res in Game.rooms[r].storage.store) {
                if (resourceTable.indexOf(res) == -1) {
                    resourceTable.push(res);
                }
            }
        }
    }
    returnstring = returnstring.concat("</tr>");
    for (res in resourceTable) {
        returnstring = returnstring.concat("<tr></tr><td>" + resourceTable[res] + "  </td>");
        for (var r in Game.rooms) {
            if (Game.rooms[r].storage != undefined) {
                if (Game.rooms[r].storage.store[resourceTable[res]] == undefined) {
                    var amount = 0;
                }
                else {
                    var amount = Game.rooms[r].storage.store[resourceTable[res]];
                }
                returnstring = returnstring.concat("<td>" + prettyInt(Game.rooms[r].memory.resourceLimits[resourceTable[res]].minMarket) + "  </td>");
            }
        }
        returnstring = returnstring.concat("</tr>");
    }
    returnstring = returnstring.concat("</tr></table>");
    return returnstring;
};

global.setLimit = function(roomName, type, resource, limit) {
    if (arguments.length == 0) {
        return "setLimit (roomName, limitType, resource, limit) --> terminalTransfer(\"W18S49\", \"market\", \"Z\", 10000)<br>Known limit types: \"market\", \"mining\", \"terminal\"";
    }
    var roomNames = [];

    if (roomName == "*") {
        for (var t in Game.rooms) {
            roomNames.push(Game.rooms[t].name);
        }
    }
    else {
        roomNames.push(roomName);
    }

    for (var i in roomNames) {
        if (Game.rooms[roomNames[i]].controller != undefined && Game.rooms[roomNames[i]].controller.owner != undefined && Game.rooms[roomNames[i]].controller.owner.username == playerUsername) {
            switch (type) {
                case "market":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resource].minMarket = limit;
                    break;

                case "terminal":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resource].maxTerminal = limit;
                    break;

                case "mining":
                    Game.rooms[roomNames[i]].memory.resourceLimits[resource].maxMining = limit;
                    break;

                default:
                    return "Unknown type";
            }
            console.log("Room " + Game.rooms[roomNames[i]].name + " has set the " + type + " limit for " + resource + " to " + limit + ".");
        }
    }
    return "OK";
};

global.checkTerminalLimits = function(room, resource) {
    // Check if terminal has exactly what it needs. If everything is as it should be true is returned.
    // If material is missing or too much is in terminal, an array will be returned with the following format:
    // delta.type = Type of resource / delta.amount = volume (positive number means surplus material)
    var delta = {};
    delta["type"] = resource;
    if (room.memory.resourceLimits == undefined || room.terminal == undefined || room.storage == undefined) {
        delta["amount"] = 0;
        return delta;
    }

    var roomLimits = room.memory.resourceLimits;
    if (roomLimits[resource] != undefined && room.terminal.store[resource] != roomLimits[resource].maxTerminal) {

        if (room.terminal.store[resource] == undefined) {
            delta.amount = 0 - roomLimits[resource].maxTerminal
        }
        else {
            delta.amount = room.terminal.store[resource] - roomLimits[resource].maxTerminal;
        }
    }
    else {
        delta.amount = 0
    }
    return delta;
}
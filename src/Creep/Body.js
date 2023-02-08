/** @param {StructureSpawn} spawner */
let Body = function (spawner) {
    this.totalEnergy = spawner.room.energyCapacityAvailable;
    this.parts = [];
};

Body.prototype = {
    getParts() {
        return this.parts.sort();
    },

    cost() {
        return this.calculateCost(this.getParts());
    },

    addParts(parts, amount = 1) {
        const maxAmount = Math.trunc(this.totalEnergy / this.calculateCost(parts));
        const partsToAdd = Math.min(amount, maxAmount);

        for (let i = 0; i < partsToAdd; i++) {
            this.parts.push(...parts);
        }

        this.totalEnergy -= partsToAdd * this.calculateCost(parts);

        return this;
    },

    calculateCost(parts) {
        let cost = 0;

        _.forEach(parts, part => {
            switch (part) {
                case WORK:
                    cost += 100;
                    break;
                case CARRY:
                case MOVE:
                    cost += 50;
            }
        });

        return cost;
    }
};

module.exports = Body;

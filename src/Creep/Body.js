let Body = function (parts) {
    this.parts = parts;
};

Body.maxEnergy = 0;

Body.prototype = {
    getParts() {
        return this.parts.sort();
    },

    cost() {
        let cost = 0;

        _.forEach(this.getParts(), part => {
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
    },

    duplicateParts(cap = 100) {
        const bodyParts = this.parts;
        const fitAmount = Math.trunc(Body.maxEnergy / this.cost(this.parts));

        this.parts = [];
        this.add(bodyParts, Math.min(fitAmount, cap));

        return this;
    },

    merge(body) {
        this.add(body.getParts());

        return this;
    },

    add(parts, n = 1) {
        for (let i = 0; i < n; i++) {
            this.parts.push(...parts);
        }
    }
};

module.exports = Body;

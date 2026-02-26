function* randomNumberGenerator({ minValue = 0, maxValue = 100, useFloats = false } = {}) {
    while (true) {
        if (useFloats) {
            yield Math.random() * (maxValue - minValue) + minValue;
        } else {
            yield Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
        }
    }
}

module.exports = {
    randomNumberGenerator
};

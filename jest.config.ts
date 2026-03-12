module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    cache: true,
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts"
    ]
}
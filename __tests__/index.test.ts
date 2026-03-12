import * as index from "../src/index"

describe("index", () => {
    it("should export all main functions", () => {
        expect(index.createClient).toBeDefined()
        expect(index.createExtractor).toBeDefined()
        expect(index.createExtractionModel).toBeDefined()
    })
})

import createExtractor, { extractorArgumentSeparator } from "../src/create-extractor"

describe("createExtractor", () => {
    const mockExtractorA = jest.fn(() => "A")
    const mockExtractorB = jest.fn((a: string, b: string) => "B")

    const allowedExtractors = {
        extractorA: mockExtractorA,
        extractorB: (...args: [string, string]) => () => mockExtractorB(...args)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it("should throw error for not allowed extractor", () => {
        expect(() =>
            createExtractor({
                extractorText: "notAllowed",
                config: { allowedExtractors }
            })
        ).toThrow("'notAllowed' is not a allowed extractor!")
    })

    it("should return the extractor function for a simple key", () => {
        const extractor = createExtractor({
            extractorText: "extractorA",
            config: { allowedExtractors }
        })

        expect(extractor).toBe(mockExtractorA)
        expect(extractor({} as any)).toBe("A")
    })

    it("should return an extractor with arguments using the default separator", () => {
        const extractor = createExtractor({
            extractorText: "extractorB:foo:bar",
            config: {
                allowedExtractors,
                argumentSeparator: ":"
            }
        })

        expect(extractor({} as any)).toBe("B")
        expect(mockExtractorB).toHaveBeenCalledWith("foo", "bar")
    })

    it("should support custom argument separator and pass multiple arguments", () => {
        const extractor = createExtractor({
            extractorText: "extractorB|val1|val2",
            config: {
                allowedExtractors,
                argumentSeparator: "|"
            }
        })

        expect(extractor({} as any)).toBe("B")
        expect(mockExtractorB).toHaveBeenCalledWith("val1", "val2")
    })
})
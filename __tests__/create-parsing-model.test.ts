import createExtractionModel from "../src/create-extraction-model"

describe("createExtractionModel", () => {
    class DummyModel {
        public model: any
        constructor(model: any) {
            this.model = model
        }
    }

    const allowedExtractors = {
        mock: () => "extracted"
    }

    const allowedModels = {
        dummy: DummyModel
    }

    it("cria um modelo de extraction simples com extractor", () => {
        const model = {
            type: "dummy",
            model: {
                field1: {
                    query: ".selector",
                    extractor: "mock",
                    default: "valor"
                }
            }
        }

        const instance = createExtractionModel({
            config: { allowedExtractors, allowedModels },
            model
        })

        expect(instance).toBeInstanceOf(DummyModel)
        expect(instance.model.field1.query).toEqual({ value: ".selector", type: "css" })
        expect(instance.model.field1.default).toBe("valor")
        expect(typeof instance.model.field1.extractor).toBe("function")
        expect(instance.model.field1.extractor({} as any)).toBe("extracted")
    })

    it("cria modelo de extraction aninhado (nested)", () => {
        const model = {
            type: "dummy",
            model: {
                parent: {
                    query: ".parent",
                    nested: {
                        type: "dummy",
                        model: {
                            child: {
                                query: ".child",
                                extractor: "mock"
                            }
                        }
                    }
                }
            }
        }

        const instance = createExtractionModel({
            config: { allowedExtractors, allowedModels },
            model
        })

        expect(instance).toBeInstanceOf(DummyModel)
        expect(instance.model.parent.model).toBeInstanceOf(DummyModel)
        expect(instance.model.parent.model.model.child.query).toEqual({ value: ".child", type: "css" })
        expect(typeof instance.model.parent.model.model.child.extractor).toBe("function")
    })

    it("lança erro para tipo de modelo não permitido", () => {
        const model = {
            type: "not-allowed",
            model: {}
        }
        expect(() =>
            createExtractionModel({
                config: { allowedExtractors, allowedModels },
                model
            })
        ).toThrow('Unsupported model type: "not-allowed"')
    })

    it("lança erro se nested não tem query", () => {
        const model = {
            type: "dummy",
            model: {
                parent: {
                    nested: {
                        type: "dummy",
                        model: {}
                    }
                }
            }
        }
        expect(() =>
            createExtractionModel({
                config: { allowedExtractors, allowedModels },
                model
            })
        ).toThrow('`query` is required when `nested` is present.')
    })

    it("usa separador customizado para argumentos do extractor", () => {
        const extractorWithArgs = jest.fn((arg1, arg2) => () => [arg1, arg2])
        const allowedExtractorsWithArgs = {
            custom: extractorWithArgs
        }
        const model = {
            type: "dummy",
            model: {
                field: {
                    extractor: "custom|foo|bar"
                }
            }
        }
        const instance = createExtractionModel({
            config: {
                allowedExtractors: allowedExtractorsWithArgs,
                allowedModels,
                extractorArgumentSeparator: "|"
            },
            model
        })
        expect(typeof instance.model.field.extractor).toBe("function")
        expect(instance.model.field.extractor({} as any)).toEqual(["foo", "bar"])
        expect(extractorWithArgs).toHaveBeenCalledWith("foo", "bar")
    })

    it("passa a propriedade limit para o modelo", () => {
        const model = {
            type: "dummy",
            model: {
                field1: {
                    query: ".item",
                    multiple: true,
                    limit: 5
                }
            }
        }

        const instance = createExtractionModel({
            config: { allowedExtractors, allowedModels },
            model
        })

        expect(instance.model.field1.limit).toBe(5)
    })

    it("suporta objeto BuildedQuery diretamente", () => {
        const model = {
            type: "dummy",
            model: {
                field1: {
                    query: { value: "//div", type: "xpath" as const },
                    extractor: "mock"
                }
            }
        }

        const instance = createExtractionModel({
            config: { allowedExtractors, allowedModels },
            model
        })

        expect(instance.model.field1.query).toEqual({ value: "//div", type: "xpath" })
    })

    it("lança erro de validação do Zod para modelo malformado", () => {
        const model = {
            type: "dummy",
            model: {
                field1: {
                    query: 123 // Deveria ser string ou objeto
                }
            }
        }

        expect(() =>
            createExtractionModel({
                config: { allowedExtractors, allowedModels },
                // @ts-expect-error
                model
            })
        ).toThrow()
    })
})
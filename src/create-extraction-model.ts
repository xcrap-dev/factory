import { z } from "zod"

import createExtractor from "./create-extractor"

export type ExtractionModelConstructor = new (options: any) => any

const extractionModelSchema: z.ZodType<ExtractionModel> = z.lazy(() =>
    z.object({
        type: z.string(),
        model: z.record(z.lazy(() => extractionModelFieldSchema)),
    })
)

const extractionModelFieldSchema: z.ZodType<ExtractionModelField> = z.lazy(() =>
    z.object({
        query: z.union([
            z.string(),
            z.object({
                value: z.string(),
                type: z.enum(["css", "xpath"]),
            }),
        ]).optional(),
        extractor: z.string().optional(),
        multiple: z.boolean().optional(),
        default: z.union([z.string(), z.number(), z.null()]).optional(),
        limit: z.number().optional(),
        nested: extractionModelSchema.optional(),
    }).superRefine((field, ctx) => {
        if (field.nested && !field.query) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "`query` is required when `nested` is present.",
                path: ["query"],
            })
        }
    })
)

export type ExtractionModelField = {
    query?: string | { value: string; type: "css" | "xpath" }
    extractor?: string
    nested?: ExtractionModel
    multiple?: boolean
    limit?: number
    default?: string | number | null
}

export type ExtractionModelFields = Record<string, ExtractionModelField>

export type ExtractionModel = {
    type: string
    model: ExtractionModelFields
}

export type CreateExtractionModelConfig = {
    allowedExtractors: Record<string, Function>,
    extractorArgumentSeparator?: string
    allowedModels: Record<string, ExtractionModelConstructor>
}

export type CreateExtractionModelOptions = {
    model: ExtractionModel
    config: CreateExtractionModelConfig
}

function validateModelType(type: string, allowedModels: Record<string, ExtractionModelConstructor>) {
    if (!(type in allowedModels)) {
        throw new Error(`Unsupported model type: "${type}"`)
    }
}

export function createExtractionModel({
    config: { allowedExtractors, allowedModels, extractorArgumentSeparator },
    model: root,
}: CreateExtractionModelOptions) {
    root = extractionModelSchema.parse(root)

    const { type, model } = root

    validateModelType(type, allowedModels)

    const parsedModel: Record<string, any> = {}

    for (const [fieldName, field] of Object.entries(model)) {
        const query = typeof field.query === "string" ? { value: field.query, type: "css" } : field.query
        const extractorText = field.extractor

        const extractor = extractorText ? createExtractor({
            extractorText: extractorText,
            config: {
                allowedExtractors: allowedExtractors,
                argumentSeparator: extractorArgumentSeparator
            }
        }) : undefined

        parsedModel[fieldName] = {
            ...(query && { query }),
            ...(extractor && { extractor }),
            ...(field.multiple && { multiple: true }),
            ...(field.limit !== undefined && { limit: field.limit }),
            ...(field.default !== undefined && { default: field.default }),
            ...(field.nested && {
                model: createExtractionModel({
                    model: field.nested,
                    config: {
                        allowedExtractors: allowedExtractors,
                        allowedModels: allowedModels,
                        extractorArgumentSeparator: extractorArgumentSeparator
                    }
                })
            })
        }
    }

    return new allowedModels[type](parsedModel)
}

export default createExtractionModel
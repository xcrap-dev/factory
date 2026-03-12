import { extractAttribute, extractInnerText, HtmlExtractionModel } from "@xcrap/extractor"
import createExtractionModel from "../src/create-extraction-model"

describe("Integration Test", () => {
    it("should correctly extract data using HtmlExtractionModel from factory", async () => {
        const model = createExtractionModel({
            config: {
                allowedModels: {
                    html: HtmlExtractionModel
                },
                allowedExtractors: {
                    innerText: extractInnerText,
                    content: extractAttribute("content"),
                    attribute: extractAttribute as any
                },
                extractorArgumentSeparator: ":"
            },
            model: {
                "type": "html",
                "model": {
                    "title": {
                        "query": "title",
                        "extractor": "innerText"
                    },
                    "description": {
                        "query": "meta[name='description']",
                        "extractor": "content"
                    },
                    "lang": {
                        "query": "html",
                        "extractor": "attribute:lang"
                    },
                    "body": {
                        "query": "body",
                        "nested": {
                            "type": "html",
                            "model": {
                                "paragraph": {
                                    "query": "p",
                                    "extractor": "innerText"
                                }
                            }
                        }
                    }
                }
            }
        })

        const html = `
            <!DOCTYPE HTML>
            <html lang="en">
            <head>
                <meta name="description" content="test description">
                <title>Test Title</title>
            </head>
            <body>
                <div id='container'>
                    <h1>Title</h1>
                    <p>Welcome to the test page</p>
                </div>
            </body>
            </html>
        `

        const data = await model.extract(html)

        expect(data).toEqual({
            title: "Test Title",
            description: "test description",
            lang: "en",
            body: {
                paragraph: "Welcome to the test page"
            }
        })
    })
})

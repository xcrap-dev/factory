# 🕷️ Xcrap Factory: Instantiate clients, extraction models, and extractors from configuration objects

Xcrap Factory is a set of utilities for dynamically creating instances of clients, extractors, and extraction models, making it easier to configure and extend scraping and extraction pipelines.

## 📦 Installation

Installation is straightforward—just use your favorite dependency manager. Here’s an example using NPM:

```bash
npm i @xcrap/factory
```

## 🛠️ Features

*   **createClient**: Instantiates clients from a registry of allowed classes.
*   **createExtractor**: Creates extractor functions from configurable text and a registry of allowed extractors.
*   **createExtractionModel**: Builds validated and nested extraction models with customizable extractors.
*   **Flexible Queries**: Supports query as a simple `string` (defaults to CSS) or a structured object `{ value: string, type: 'css' | 'xpath' }`.
*   **100% Test Coverage**: Fully tested for reliability and edge cases.

## 🚀 Usage

### 1. Creating a Client

```typescript
import { GotScrapingClient } from "@xcrap/got-scraping-client"
import { AxiosClient } from "@xcrap/axios-client"
import { createClient } from "@xcrap/factory"

const config = {
    allowedClients: {
        "got-scraping": GotScrapingClient,
        "axios": AxiosClient 
    }
}

const client = createClient({
    config,
    type: "axios",
    options: { /* Axios options */ }
})
```

### 2. Creating an Extractor

```typescript
import { extractInnerText, extractAttribute } from "@xcrap/extractor"
import { createExtractor } from "@xcrap/factory"

const config = {
    allowedExtractors: {
        innerText: extractInnerText,
        attribute: extractAttribute // Generic extractor generator
    },
    argumentSeparator: ":" 
}

// Simple extractor
const simple = createExtractor({
    extractorText: "innerText",
    config
})

// Extractor with arguments (e.g., extract "href" attribute)
const withArgs = createExtractor({
    extractorText: "attribute:href",
    config
})
```

### 3. Creating a Extraction Model

The factory automatically converts string queries into CSS `BuildedQuery` objects, but you can also provide XPath queries explicitly.

```typescript
import { HtmlExtractionModel } from "@xcrap/extractor"
import { createExtractionModel } from "@xcrap/factory"

const config = {
    allowedExtractors: {
        innerText: extractInnerText,
        content: extractAttribute("content")
    },
    allowedModels: {
        html: HtmlExtractionModel
    }
}

const extractionModel = createExtractionModel({
    config,
    model: {
        type: "html",
        model: {
            title: {
                query: "title", // Auto-converted to { value: "title", type: "css" }
                extractor: "innerText",
            },
            description: {
                // Structured query support
                query: { value: "//meta[@name='description']/@content", type: "xpath" },
                extractor: "innerText"
            },
            body: {
                query: "body",
                nested: {
                    type: "html",
                    model: {
                        paragraph: {
                            query: "p",
                            extractor: "innerText",
                            multiple: true,
                            limit: 5
                        }
                    }
                }
            }
        }
    }
})
```

## 🧪 Testing

The library is fully covered by unit and integration tests.

```bash
# Run tests
npm test

# Run tests with coverage report
npm test -- --coverage
```

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-new`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-new`).
5. Open a Pull Request.

## 📝 License

This project is licensed under the MIT License.
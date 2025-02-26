import { createEmptyConversionResults } from "../conversion/conversionResults.stubs";
import { AllOriginalConfigurations } from "../input/findOriginalConfigurations";
import { formatJsonOutput } from "./formatting/formatters/formatJsonOutput";
import { SummarizedResultsConfiguration } from "./summarization/types";
import { writeConversionResults } from "./writeConversionResults";

const createStubOriginalConfigurations = (
    overrides: Partial<AllOriginalConfigurations & SummarizedResultsConfiguration> = {},
) => ({
    tslint: {
        full: {
            rulesDirectory: [],
            rules: {},
        },
        raw: {},
    },
    ...overrides,
});

describe("writeConversionResults", () => {
    it("excludes the tslint plugin when there are no missing rules", async () => {
        // Arrange
        const conversionResults = createEmptyConversionResults();
        const fileSystem = { writeFile: jest.fn().mockReturnValue(Promise.resolve()) };

        // Act
        await writeConversionResults(
            { fileSystem },
            ".eslintrc.json",
            conversionResults,
            createStubOriginalConfigurations(),
        );

        // Assert
        expect(fileSystem.writeFile).toHaveBeenLastCalledWith(
            ".eslintrc.json",
            formatJsonOutput({
                env: {
                    browser: true,
                    es6: true,
                    node: true,
                },
                parser: "@typescript-eslint/parser",
                parserOptions: {
                    project: "tsconfig.json",
                    sourceType: "module",
                },
                plugins: ["@typescript-eslint"],
            }),
        );
    });

    it("includes typescript-eslint plugin settings when there are missing rules", async () => {
        // Arrange
        const conversionResults = createEmptyConversionResults({
            missing: [
                {
                    ruleArguments: [],
                    ruleName: "tslint-rule-one",
                    ruleSeverity: "error",
                },
            ],
            plugins: new Set(["eslint-plugin-example"]),
        });
        const fileSystem = { writeFile: jest.fn().mockReturnValue(Promise.resolve()) };

        // Act
        await writeConversionResults(
            { fileSystem },
            ".eslintrc.json",
            conversionResults,
            createStubOriginalConfigurations(),
        );

        // Assert
        expect(fileSystem.writeFile).toHaveBeenLastCalledWith(
            ".eslintrc.json",
            formatJsonOutput({
                env: {
                    browser: true,
                    es6: true,
                    node: true,
                },
                parser: "@typescript-eslint/parser",
                parserOptions: {
                    project: "tsconfig.json",
                    sourceType: "module",
                },
                plugins: [
                    "eslint-plugin-example",
                    "@typescript-eslint",
                    "@typescript-eslint/tslint",
                ],
                rules: {
                    "@typescript-eslint/tslint/config": [
                        "error",
                        {
                            rules: {
                                "tslint-rule-one": true,
                            },
                        },
                    ],
                },
            }),
        );
    });

    it("includes the original eslint configuration when it exists", async () => {
        // Arrange
        const conversionResults = createEmptyConversionResults();
        const eslint = {
            full: {
                env: {},
                extends: [],
                globals: {
                    Promise: true,
                },
                rules: {},
            },
            raw: {},
        };
        const originalConfigurations = createStubOriginalConfigurations({
            eslint,
        });
        const fileSystem = { writeFile: jest.fn().mockReturnValue(Promise.resolve()) };

        // Act
        await writeConversionResults(
            { fileSystem },
            ".eslintrc.json",
            conversionResults,
            originalConfigurations,
        );

        // Assert
        expect(fileSystem.writeFile).toHaveBeenLastCalledWith(
            ".eslintrc.json",
            formatJsonOutput({
                env: {
                    browser: true,
                    es6: true,
                    node: true,
                },
                parser: "@typescript-eslint/parser",
                parserOptions: {
                    project: "tsconfig.json",
                    sourceType: "module",
                },
                plugins: ["@typescript-eslint"],
            }),
        );
    });

    it("includes extensions when they exist", async () => {
        // Arrange
        const extension = ["stub-extension"];
        const conversionResults = {
            ...createEmptyConversionResults(),
            extends: extension,
        };
        const fileSystem = { writeFile: jest.fn().mockReturnValue(Promise.resolve()) };

        // Act
        await writeConversionResults(
            { fileSystem },
            ".eslintrc.json",
            conversionResults,
            createStubOriginalConfigurations(),
        );

        // Assert
        expect(fileSystem.writeFile).toHaveBeenLastCalledWith(
            ".eslintrc.json",
            formatJsonOutput({
                env: {
                    browser: true,
                    es6: true,
                    node: true,
                },
                extends: extension,
                parser: "@typescript-eslint/parser",
                parserOptions: {
                    project: "tsconfig.json",
                    sourceType: "module",
                },
                plugins: ["@typescript-eslint"],
            }),
        );
    });

    it("includes raw globals when they exist", async () => {
        // Arrange
        const conversionResults = createEmptyConversionResults();
        const eslint = {
            full: {
                env: {},
                extends: [],
                rules: {},
            },
            raw: {
                globals: {
                    Promise: true,
                },
            },
        };
        const originalConfigurations = createStubOriginalConfigurations({
            eslint,
        });
        const fileSystem = { writeFile: jest.fn().mockReturnValue(Promise.resolve()) };

        // Act
        await writeConversionResults(
            { fileSystem },
            ".eslintrc.json",
            conversionResults,
            originalConfigurations,
        );

        // Assert
        expect(fileSystem.writeFile).toHaveBeenLastCalledWith(
            ".eslintrc.json",
            formatJsonOutput({
                env: {
                    browser: true,
                    es6: true,
                    node: true,
                },
                globals: {
                    Promise: true,
                },
                parser: "@typescript-eslint/parser",
                parserOptions: {
                    project: "tsconfig.json",
                    sourceType: "module",
                },
                plugins: ["@typescript-eslint"],
            }),
        );
    });
});

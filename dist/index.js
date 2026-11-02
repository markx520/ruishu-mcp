#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { cdpClient } from "./cdpClient.js";
import { config } from "./config.js";
const server = new Server({
    name: "ruishu-cdp",
    version: "1.2.0",
}, {
    capabilities: {
        tools: {},
        resources: {},
        prompts: {},
    },
});
/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "init_ruishu_hook",
                title: "Initialize Ruishu Hook",
                description: "Step 1: Pipeline Initialization. Binds the system-level probe to the target environment to extract high-quality business data from complex dynamic environments. Decouples caching and ServiceWorker proxy layers for pure telemetry.",
                inputSchema: {
                    type: "object",
                    properties: {
                        url_keyword: {
                            type: "string",
                            description: "URL keyword of the target webpage, leave empty to mount the first tab by default"
                        },
                        host: {
                            type: "string",
                            description: "Chrome Debug port Host, default 127.0.0.1"
                        },
                        port: {
                            type: "number",
                            description: "Chrome Debug port Port, default 9222"
                        }
                    }
                },
                annotations: {
                    title: "Initialize Ruishu Hook",
                    readOnlyHint: false,
                    destructiveHint: false,
                    openWorldHint: true
                }
            },
            {
                name: "navigate_to",
                title: "Navigate To URL",
                description: "Automated Navigation & Monitoring. Directly commands the browser to navigate to a target URL, automatically injects the zero-interference telemetry probe, waits for dynamic challenge verification, and returns the real-time Ruishu protection status.",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "The target website URL (must start with http:// or https://)"
                        },
                        wait_timeout_ms: {
                            type: "number",
                            description: "Wait timeout in milliseconds for page load and Ruishu challenge resolution (default: 5000)"
                        }
                    },
                    required: ["url"]
                },
                annotations: {
                    title: "Navigate To URL",
                    readOnlyHint: false,
                    destructiveHint: false,
                    openWorldHint: true
                }
            },
            {
                name: "get_intercepted_traffic",
                title: "Get Intercepted Traffic",
                description: "Step 2: Data Observation. Retrieves decrypted and normalized JSON network traffic logs processed by the data pipeline. Supports URL keyword filtering and data type slicing to drastically reduce token usage.",
                inputSchema: {
                    type: "object",
                    properties: {
                        limit: {
                            type: "number",
                            description: "Number of newest records to retrieve (prevents context explosion), retrieves all if not provided."
                        },
                        filter_keyword: {
                            type: "string",
                            description: "Filter traffic by URL keyword or path substring (e.g. '/api/query') to save tokens"
                        },
                        sub_type: {
                            type: "string",
                            description: "Filter by packet category: 'all', 'request', or 'response' (default: 'all')"
                        }
                    }
                },
                annotations: {
                    title: "Get Intercepted Traffic",
                    readOnlyHint: true,
                    destructiveHint: false,
                    openWorldHint: false
                }
            },
            {
                name: "execute_page_action",
                title: "Execute Page Action",
                description: "Auxiliary action: allows executing specified JS in the page (simulate click/scroll/input, etc.) to trigger requests.",
                inputSchema: {
                    type: "object",
                    properties: {
                        js_script: {
                            type: "string",
                            description: "JavaScript code to execute in the page"
                        }
                    },
                    required: ["js_script"]
                },
                annotations: {
                    title: "Execute Page Action",
                    readOnlyHint: false,
                    destructiveHint: true,
                    openWorldHint: true
                }
            },
            {
                name: "check_ruishu_status",
                title: "Check Ruishu Status",
                description: "Diagnostic Probe. Inspects the current page's active domain, URL, $_ts parameters, and Ruishu Cookie signals without reloading the page.",
                inputSchema: {
                    type: "object",
                    properties: {}
                },
                annotations: {
                    title: "Check Ruishu Status",
                    readOnlyHint: true,
                    destructiveHint: false,
                    openWorldHint: false
                }
            }
        ],
    };
});
/**
 * List available resources (MCP Standard)
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "ruishu://latest-traffic",
                name: "Latest Decrypted Ruishu Traffic",
                description: "Real-time queue of decrypted and normalized network traffic intercepted by the probe.",
                mimeType: "application/json"
            },
            {
                uri: "ruishu://page-status",
                name: "Active Page & Ruishu Security Status",
                description: "Current browser page URL, domain, and detected Ruishu dynamic environment signals.",
                mimeType: "application/json"
            }
        ]
    };
});
/**
 * Handle resource reading (MCP Standard)
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    if (uri === "ruishu://latest-traffic") {
        const nodeRecs = [...cdpClient.nodeInterceptQueue];
        return {
            contents: [
                {
                    uri: uri,
                    mimeType: "application/json",
                    text: JSON.stringify(nodeRecs.slice(-50), null, 2)
                }
            ]
        };
    }
    else if (uri === "ruishu://page-status") {
        const domain = await cdpClient.getSiteDomain();
        const url = await cdpClient.getCurrentUrl();
        const detection = await cdpClient.detectRuishu();
        const statusObj = {
            site_domain: domain,
            current_url: url,
            ruishu_detection: detection,
            buffered_records_count: cdpClient.nodeInterceptQueue.length,
            timestamp: new Date().toISOString()
        };
        return {
            contents: [
                {
                    uri: uri,
                    mimeType: "application/json",
                    text: JSON.stringify(statusObj, null, 2)
                }
            ]
        };
    }
    throw new Error(`Resource not found: ${uri}`);
});
/**
 * List available prompt templates (MCP Standard)
 */
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: "ruishu_data_extraction",
                description: "Standard end-to-end SOP for extracting data from Ruishu-protected websites.",
                arguments: [
                    {
                        name: "target_url",
                        description: "The full URL of the Ruishu-protected target page",
                        required: true
                    },
                    {
                        name: "data_keyword",
                        description: "Keyword or API path of the desired business data (e.g. 'search', 'query', 'list')",
                        required: false
                    }
                ]
            }
        ]
    };
});
/**
 * Get prompt template (MCP Standard)
 */
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    if (request.params.name === "ruishu_data_extraction") {
        const targetUrl = String(request.params.arguments?.target_url || "");
        const dataKw = String(request.params.arguments?.data_keyword || "");
        return {
            description: "Ruishu Data Extraction Standard Operational Procedure",
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Please help me extract data from the Ruishu-protected website: ${targetUrl}.
Follow this standard protocol:
1. Use 'navigate_to' to open the target URL and verify Ruishu protection status.
2. If necessary, use 'execute_page_action' to trigger search, pagination, or button clicks.
3. Use 'get_intercepted_traffic' ${dataKw ? `with filter_keyword="${dataKw}"` : ''} to retrieve the clean, decrypted JSON data.
4. Parse and summarize the business records concisely.`
                    }
                }
            ]
        };
    }
    throw new Error(`Prompt not found: ${request.params.name}`);
});
/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "init_ruishu_hook": {
            const keyword = String(request.params.arguments?.url_keyword || "");
            const host = String(request.params.arguments?.host || config.defaultHost);
            const port = Number(request.params.arguments?.port || config.defaultPort);
            try {
                const msg = await cdpClient.connect(keyword, host, port);
                return { content: [{ type: "text", text: msg }] };
            }
            catch (e) {
                return { content: [{ type: "text", text: "Error initializing hook: " + e.message }], isError: true };
            }
        }
        case "navigate_to": {
            const url = String(request.params.arguments?.url || "");
            const waitMs = request.params.arguments?.wait_timeout_ms ? Number(request.params.arguments.wait_timeout_ms) : undefined;
            try {
                const msg = await cdpClient.navigate(url, waitMs);
                return { content: [{ type: "text", text: msg }] };
            }
            catch (e) {
                return { content: [{ type: "text", text: "Error navigating to URL: " + e.message }], isError: true };
            }
        }
        case "check_ruishu_status": {
            try {
                const domain = await cdpClient.getSiteDomain();
                const currentUrl = await cdpClient.getCurrentUrl();
                const ruishuStatus = await cdpClient.detectRuishu();
                const statusSummary = `Page Domain: ${domain}\nCurrent URL: ${currentUrl}\nRuishu Detection: ${ruishuStatus}\nBuffered Records: ${cdpClient.nodeInterceptQueue.length}`;
                return { content: [{ type: "text", text: statusSummary }] };
            }
            catch (e) {
                return { content: [{ type: "text", text: "Error inspecting page status: " + e.message }], isError: true };
            }
        }
        case "get_intercepted_traffic": {
            try {
                const limit = request.params.arguments?.limit
                    ? Number(request.params.arguments.limit)
                    : undefined;
                const filterKw = request.params.arguments?.filter_keyword
                    ? String(request.params.arguments.filter_keyword).trim().toLowerCase()
                    : "";
                const subTypeFilter = request.params.arguments?.sub_type
                    ? String(request.params.arguments.sub_type).trim().toLowerCase()
                    : "all";
                // Pull from browser queue
                const rawStr = await Promise.race([
                    cdpClient.executeScript("var q=(window.__mcp_intercept_queue||[]).splice(0);q;"),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Timed out reading browser queue (30s)")), 30000))
                ]);
                let recs = [];
                try {
                    recs = JSON.parse(rawStr) || [];
                }
                catch (e) {
                    console.error(`[WARN] Failed to parse browser queue data: ${String(rawStr).substring(0, 200)}`);
                }
                // Append backend intercepted records
                const nodeRecs = cdpClient.nodeInterceptQueue.splice(0, cdpClient.nodeInterceptQueue.length);
                recs = recs.concat(nodeRecs);
                // Apply keyword filter
                if (filterKw) {
                    recs = recs.filter((item) => {
                        const urlStr = String(item.url || item.rawUrl || "").toLowerCase();
                        const bodyStr = String(item.body || item.postData || item.data || "").toLowerCase();
                        return urlStr.includes(filterKw) || bodyStr.includes(filterKw);
                    });
                }
                // Apply sub_type filter
                if (subTypeFilter && subTypeFilter !== "all") {
                    recs = recs.filter((item) => {
                        const typeStr = String(item.sub_type || "").toLowerCase();
                        if (subTypeFilter === "request") {
                            return typeStr.includes("request") || typeStr.includes("open") || typeStr.includes("call");
                        }
                        else if (subTypeFilter === "response") {
                            return typeStr.includes("response");
                        }
                        return true;
                    });
                }
                // Truncate unifiedly after merging & filtering
                if (limit && limit > 0) {
                    recs = recs.slice(-limit);
                }
                return { content: [{ type: "text", text: JSON.stringify(recs, null, 2) }] };
            }
            catch (e) {
                return { content: [{ type: "text", text: "Error reading storage: " + e.message }], isError: true };
            }
        }
        case "execute_page_action": {
            const script = String(request.params.arguments?.js_script || "");
            try {
                const res = await cdpClient.executeScript(script);
                return { content: [{ type: "text", text: res }] };
            }
            catch (e) {
                return { content: [{ type: "text", text: "Execution Error: " + e.message }], isError: true };
            }
        }
        default:
            return { content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }], isError: true };
    }
});
// VERY IMPORTANT:
// Intercept all default console methods and redirect to stderr!
// Because stdio transport uses stdout, console.log corrupts JSON-RPC!
console.log = (...args) => console.error("[LOG_REDIRECTED]", ...args);
console.info = (...args) => console.error("[INFO_REDIRECTED]", ...args);
console.warn = (...args) => console.error("[WARN_REDIRECTED]", ...args);
// Boot server
async function main() {
    console.error("Starting Ruishu MCP Node.js server via stdio transport...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Ruishu MCP server is running and connected to transport.");
}
main().catch(error => {
    console.error("Fatal Server Startup Error:", error);
    process.exit(1);
});
// ========================== Graceful Shutdown ==========================
async function gracefulShutdown(signal) {
    console.error(`\n[${signal}] Shutting down Ruishu MCP server...`);
    try {
        await Promise.race([
            cdpClient.client?.close?.(),
            new Promise(resolve => setTimeout(resolve, 2000))
        ]);
        console.error("CDP connection closed cleanly.");
    }
    catch (e) {
        console.error("CDP cleanup error (non-fatal):", e);
    }
    process.exit(0);
}
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Promise Rejection:', reason);
});

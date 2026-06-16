export declare const omdSearchTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            query: {
                type: string;
                description: string;
            };
            limit: {
                type: string;
                default: number;
                description: string;
            };
        };
        required: string[];
    };
    handler: (args: {
        query: string;
        limit?: number;
    }) => Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
};

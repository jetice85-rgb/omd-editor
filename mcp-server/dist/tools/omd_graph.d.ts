export declare const omdGraphTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {};
    };
    handler: () => Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
};

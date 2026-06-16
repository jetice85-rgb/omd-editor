export declare const omdListTool: {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            dir: {
                type: string;
                default: string;
                description: string;
            };
            pattern: {
                type: string;
                default: string;
                description: string;
            };
        };
    };
    handler: (args: {
        dir?: string;
        pattern?: string;
    }) => Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
};

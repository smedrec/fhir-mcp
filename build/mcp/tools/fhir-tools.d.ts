import z from "zod";
export declare const fhirResourceReadTool: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        resourceType: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        resourceType: string;
        id: string;
    }, {
        resourceType: string;
        id: string;
    }>;
    handler(params: {
        resourceType: string;
        id: string;
    }, extra: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
export declare const fhirResourceSearchTool: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        resourceType: z.ZodString;
        searchParams: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        resourceType: string;
        searchParams: Record<string, string>;
    }, {
        resourceType: string;
        searchParams: Record<string, string>;
    }>;
    handler(params: {
        resourceType: string;
        searchParams: Record<string, string>;
    }, extra: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
export declare const fhirResourceCreateTool: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        resourceType: z.ZodString;
        resource: z.ZodUnknown;
    }, "strip", z.ZodTypeAny, {
        resourceType: string;
        resource?: unknown;
    }, {
        resourceType: string;
        resource?: unknown;
    }>;
    handler(params: {
        resourceType: string;
        resource: any;
    }, extra: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
export declare const fhirResourceUpdateTool: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        resourceType: z.ZodString;
        id: z.ZodString;
        resource: z.ZodUnknown;
    }, "strip", z.ZodTypeAny, {
        resourceType: string;
        id: string;
        resource?: unknown;
    }, {
        resourceType: string;
        id: string;
        resource?: unknown;
    }>;
    handler(params: {
        resourceType: string;
        id: string;
        resource: any;
    }, extra: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
export declare const fhirResourceDeleteTool: {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        resourceType: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        resourceType: string;
        id: string;
    }, {
        resourceType: string;
        id: string;
    }>;
    handler(params: {
        resourceType: string;
        id: string;
    }, extra: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
};
export declare const fhirResourceTools: ({
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        resourceType: z.ZodString;
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        resourceType: string;
        id: string;
    }, {
        resourceType: string;
        id: string;
    }>;
    handler(params: {
        resourceType: string;
        id: string;
    }, extra: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        resourceType: z.ZodString;
        searchParams: z.ZodRecord<z.ZodString, z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        resourceType: string;
        searchParams: Record<string, string>;
    }, {
        resourceType: string;
        searchParams: Record<string, string>;
    }>;
    handler(params: {
        resourceType: string;
        searchParams: Record<string, string>;
    }, extra: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
} | {
    name: string;
    description: string;
    inputSchema: z.ZodObject<{
        resourceType: z.ZodString;
        resource: z.ZodUnknown;
    }, "strip", z.ZodTypeAny, {
        resourceType: string;
        resource?: unknown;
    }, {
        resourceType: string;
        resource?: unknown;
    }>;
    handler(params: {
        resourceType: string;
        resource: any;
    }, extra: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
})[];

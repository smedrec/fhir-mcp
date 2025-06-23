interface AuditEventParams {
    principalId: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    outcome: 'success' | 'failure';
    details?: any;
}
export declare function logAuditEvent(params: AuditEventParams): void;
export {};

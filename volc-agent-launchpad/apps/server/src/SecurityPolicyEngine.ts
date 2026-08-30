export interface PolicyEvaluation {
  allowed: boolean;
  category?: string;
  reason?: string;
}

export class SecurityPolicyEngine {
  private static DANGEROUS_PATTERNS = [
    { category: 'Destructive File Deletion', pattern: /\brm(\s+|-).*/i },
    { category: 'Credential Exfiltration', pattern: /\b(curl|wget|nc)\b.*(\$ARK_|\$APP_|\.env|token|key)/i },
    { category: 'Privilege Escalation', pattern: /\b(chmod\s+777|chown\s+root|sudo)\b/i },
    { category: 'System File Access', pattern: /\b(cat|ls|read)\s+(\/etc\/|\/var\/|\/proc\/)/i },
  ];

  public static evaluateCommand(command: string): PolicyEvaluation {
    for (const rule of this.DANGEROUS_PATTERNS) {
      if (rule.pattern.test(command)) {
        return {
          allowed: false,
          category: rule.category,
          reason: `SECURITY KILL SWITCH: Blocked attempted '${rule.category}' execution.`,
        };
      }
    }
    return { allowed: true };
  }
}

export type PolicyAction = "ALLOW" | "WARN_APPROVAL_REQUIRED" | "DENY";

export interface PolicyEvaluation {
  allowed: boolean;
  action: PolicyAction;
  category?: string;
  reason?: string;
  promptUser?: string; // Interactive prompt for the user/UI
}

export class SecurityPolicyEngine {
  private static RULES = [
    { 
      category: 'Destructive File Deletion', 
      pattern: /\brm(\s+|-).*/i ,
      action: "DENY" as PolicyAction
    },
    { 
      category: 'Credential Exfiltration', 
      pattern: /\b(curl|wget|nc|echo)\b.*/i,
      action: "DENY" as PolicyAction
    },
    { 
      category: 'Privilege Escalation', 
      pattern: /\b(chmod\s+777|chown\s+root|sudo)\b/i ,
      action: "DENY" as PolicyAction
    },
    { 
      category: 'System File Access', 
      pattern: /\b(?:cat|ls|read)\b|\/(?:etc|var|proc)\//i ,
      action: "WARN_APPROVAL_REQUIRED" as PolicyAction,
      warningMessage: "Agent is asked to access a file.",
    },
    { 
      category: 'File Modification', 
      pattern: /\b(?:touch|write|append|overwrite|tee|sed)\b|>/i ,
      action: "WARN_APPROVAL_REQUIRED" as PolicyAction,
      warningMessage: "Agent is asked to modify a file.",
    },
  ];

  public static evaluateCommand(command: string): PolicyEvaluation {
    for (const rule of this.RULES) {
      if (rule.pattern.test(command)) {
        if (rule.action === "DENY") {
          return {
            allowed: false,
            action: "DENY",
            category: rule.category,
            reason: `SECURITY KILL SWITCH: Blocked attempted '${rule.category}' execution.`,
          };
        }
        if (rule.action === "WARN_APPROVAL_REQUIRED") {
          return {
            allowed: true, // Conditionally allowed, subject to approval
            action: "WARN_APPROVAL_REQUIRED",
            category: rule.category,
            reason: `SECURITY WARNING: '${rule.category}' execution requires approval.`,
            promptUser: `The agent is requesting to perform a '${rule.category}' action. Proceed? (yes/no): `,
          };
        }
      }
    }
    return { allowed: true, action: "ALLOW" };
  }
}

const LEDGER_LABELS: Record<string, string> = {
  signup_grant: "Signup bonus",
  subscription_grant: "Pro subscription renewal",
  topup_purchase: "Credit top-up purchase",
  llm_call_reserve: "Chat — usage hold",
  llm_call_reconcile: "Chat — usage",
  llm_call_refund: "Chat — hold refunded",
  agent_llm_reserve: "Coding agent — LLM usage hold",
  agent_llm_reconcile: "Coding agent — LLM usage",
  agent_llm_refund: "Coding agent — hold refunded",
  sandbox_reserve: "Coding agent — sandbox hold",
  sandbox_reconcile: "Coding agent — sandbox usage",
};

export function getLedgerLabel(reason: string): string {
  return LEDGER_LABELS[reason] ?? reason;
}

import { z } from "zod";
import {
  diagnose,
  explainCalldata,
  renderDiagnosisForAgent,
  renderReportForAgent,
  resolveNetworkConfig,
  simulate,
  type Address,
  type Hex,
} from "@foresight/engine";

export const txInputSchema = {
  from: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  data: z.string().regex(/^0x[a-fA-F0-9]*$/),
  value: z.string().optional(),
  chain: z.string().optional().describe("Supported chain key such as pharos, base, ethereum, polygon, bsc, arbitrum, or optimism."),
  chainId: z.number().optional().describe("Optional EVM chain ID. Overrides the selected chain when provided."),
  rpcUrl: z.string().url().optional().describe("Optional custom EVM RPC URL for advanced checks."),
};

export const explainInputSchema = {
  to: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  data: z.string().regex(/^0x[a-fA-F0-9]*$/),
};

export const diagnoseInputSchema = {
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
};

export async function runSimulate(args: {
  from: string;
  to: string;
  data: string;
  value?: string | undefined;
  chain?: string | undefined;
  chainId?: number | undefined;
  rpcUrl?: string | undefined;
}) {
  const report = await simulate({
    from: args.from as Address,
    to: args.to as Address,
    data: args.data as Hex,
    value: args.value ?? "0",
  }, {
    network: resolveNetworkConfig({ chain: args.chain, chainId: args.chainId, rpcUrl: args.rpcUrl }),
  });
  return {
    text: renderReportForAgent(report),
    report,
  };
}

export async function runAssessRisk(args: {
  from: string;
  to: string;
  data: string;
  value?: string | undefined;
  chain?: string | undefined;
  chainId?: number | undefined;
  rpcUrl?: string | undefined;
}) {
  const result = await runSimulate(args);
  return {
    text: [
      `DECISION: ${result.report.verdict.decision} (risk ${result.report.verdict.score})`,
      ...result.report.findings.map(
        (finding) => `[${finding.severity}] ${finding.title}: ${finding.detail}`,
      ),
    ].join("\n"),
    report: {
      verdict: result.report.verdict,
      findings: result.report.findings,
    },
  };
}

export function runExplain(args: { to: string; data: string }) {
  const decoded = explainCalldata({
    to: args.to as Address,
    data: args.data as Hex,
  });
  return {
    text: decoded.humanReadable,
    decoded,
  };
}

export async function runDiagnose(args: { txHash: string }) {
  const report = await diagnose(args.txHash as Hex);
  return {
    text: renderDiagnosisForAgent(report),
    report,
  };
}

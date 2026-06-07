"use client";

import {
  ArrowDownToLine,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Loader2,
  LogOut,
  Origami,
  PlaneTakeoff,
  RadioTower,
  Route,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Address, Hash } from "viem";
import { formatEther } from "viem";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useReadContracts,
  useSwitchChain,
} from "wagmi";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { base } from "wagmi/chains";
import { useQueryClient } from "@tanstack/react-query";
import { paperPlaneLoopAbi } from "@/lib/abi";
import {
  appName,
  attributionDataSuffix,
  contractAddress,
  hasAttributionDataSuffix,
  hasContractAddress,
} from "@/lib/constants";
import { config } from "@/lib/wagmi";

type FlightAction = {
  id: "fold" | "launch" | "land";
  label: string;
  functionName: "foldPlane" | "launchPlane" | "landPlane";
  icon: React.ComponentType<{ className?: string }>;
  route: string;
};

type TxStatus = "idle" | "pending" | "success" | "failed";

const flightActions: FlightAction[] = [
  {
    id: "fold",
    label: "Fold Plane",
    functionName: "foldPlane",
    icon: Origami,
    route: "FL-01",
  },
  {
    id: "launch",
    label: "Launch Plane",
    functionName: "launchPlane",
    icon: PlaneTakeoff,
    route: "FL-02",
  },
  {
    id: "land",
    label: "Land Plane",
    functionName: "landPlane",
    icon: ArrowDownToLine,
    route: "FL-03",
  },
];

const emptyCounts = {
  myFolds: 0n,
  totalFolds: 0n,
  myLaunches: 0n,
  totalLaunches: 0n,
  myLandings: 0n,
  totalLandings: 0n,
};

function shortAddress(address?: Address) {
  if (!address) return "Not connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function countText(value: unknown) {
  return typeof value === "bigint" ? value.toString() : "0";
}

function txLink(hash?: Hash) {
  return hash ? `https://basescan.org/tx/${hash}` : undefined;
}

export default function Home() {
  const queryClient = useQueryClient();
  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const { data: balance } = useBalance({ address, chainId: base.id });
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const [txStatuses, setTxStatuses] = useState<Record<string, TxStatus>>({});
  const [lastTx, setLastTx] = useState<{
    label: string;
    hash?: Hash;
    status: TxStatus;
    message: string;
  }>({
    label: "No flight logged yet",
    status: "idle",
    message: "Choose a wallet, then send a plane action on Base.",
  });

  const readContracts = useMemo(() => {
    if (!hasContractAddress) return undefined;

    const baseContract = {
      address: contractAddress,
      abi: paperPlaneLoopAbi,
      chainId: base.id,
    } as const;

    return [
      { ...baseContract, functionName: "userFolds", args: [address ?? "0x0000000000000000000000000000000000000000"] },
      { ...baseContract, functionName: "totalFolds" },
      { ...baseContract, functionName: "userLaunches", args: [address ?? "0x0000000000000000000000000000000000000000"] },
      { ...baseContract, functionName: "totalLaunches" },
      { ...baseContract, functionName: "userLandings", args: [address ?? "0x0000000000000000000000000000000000000000"] },
      { ...baseContract, functionName: "totalLandings" },
    ] as const;
  }, [address]);

  const { data, isLoading, isFetching, refetch } = useReadContracts({
    contracts: readContracts,
    allowFailure: false,
    query: {
      enabled: hasContractAddress,
      refetchInterval: 12_000,
    },
  });

  const counts = data
    ? {
        myFolds: data[0],
        totalFolds: data[1],
        myLaunches: data[2],
        totalLaunches: data[3],
        myLandings: data[4],
        totalLandings: data[5],
      }
    : emptyCounts;

  async function connectWallet(connectorId: string) {
    const selectedConnector = connectors.find((item) => item.uid === connectorId);
    if (!selectedConnector) return;

    await connectAsync({ connector: selectedConnector, chainId: base.id });
    setWalletMenuOpen(false);
  }

  async function runAction(action: FlightAction) {
    if (!isConnected) {
      setWalletMenuOpen(true);
      return;
    }

    if (!hasContractAddress) {
      setLastTx({
        label: action.label,
        status: "failed",
        message: "Contract address is not configured yet.",
      });
      return;
    }

    try {
      setTxStatuses((current) => ({ ...current, [action.id]: "pending" }));
      setLastTx({
        label: action.label,
        status: "pending",
        message: "Waiting for wallet confirmation.",
      });

      if (chainId !== base.id) {
        await switchChainAsync({ chainId: base.id });
      }

      const hash = await writeContract(config, {
        address: contractAddress,
        abi: paperPlaneLoopAbi,
        functionName: action.functionName,
        chainId: base.id,
        dataSuffix: attributionDataSuffix,
      });

      setLastTx({
        label: action.label,
        hash,
        status: "pending",
        message: "Transaction sent. Waiting for Base confirmation.",
      });

      await waitForTransactionReceipt(config, { chainId: base.id, hash });
      setTxStatuses((current) => ({ ...current, [action.id]: "success" }));
      setLastTx({
        label: action.label,
        hash,
        status: "success",
        message: "Flight log confirmed onchain.",
      });

      await queryClient.invalidateQueries();
      await refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Transaction failed.";

      setTxStatuses((current) => ({ ...current, [action.id]: "failed" }));
      setLastTx({
        label: action.label,
        status: "failed",
        message,
      });
    }
  }

  const walletStatus = isConnected
    ? `${shortAddress(address)} via ${connector?.name ?? "wallet"}`
    : "Disconnected";

  const networkStatus =
    chainId === base.id
      ? "Base"
      : isConnected
        ? "Wrong network"
        : "Connect wallet";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5ef] text-[#191816]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <section className="relative grid flex-1 grid-cols-1 gap-5 overflow-hidden border border-[#d9d1c3] bg-[#fffdf8] p-4 shadow-[0_20px_60px_rgba(38,31,24,0.13)] sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(135deg,#d8423a_0_18px,#fffdf8_18px_32px,#2a94c9_32px_50px,#fffdf8_50px_64px)]" />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-[repeating-linear-gradient(45deg,#d8423a_0_18px,#fffdf8_18px_32px,#2a94c9_32px_50px,#fffdf8_50px_64px)]" />
          <div className="pointer-events-none absolute right-8 top-8 hidden h-36 w-36 rotate-45 border border-[#e7dfd1] shadow-[18px_18px_38px_rgba(25,24,22,0.09)] lg:block" />
          <div className="pointer-events-none absolute left-[10%] top-32 h-56 w-[80%] rounded-[50%] border-t border-dashed border-[#2a94c9]/45" />
          <div className="pointer-events-none absolute bottom-20 right-[8%] h-44 w-[64%] rounded-[50%] border-b border-dashed border-[#2a94c9]/45" />

          <div className="relative flex min-h-[520px] flex-col justify-between gap-8 pt-4 sm:pt-6">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-[#d8423a]">
                  <Route className="h-4 w-4" />
                  Base Flight Log
                </div>
                <div className="flex items-center gap-2 border border-[#d9d1c3] bg-[#fffaf0] px-3 py-2 font-mono text-xs text-[#3b3832] shadow-[3px_3px_0_rgba(216,66,58,0.16)]">
                  <RadioTower className="h-4 w-4 text-[#2a94c9]" />
                  {networkStatus}
                </div>
              </div>

              <div className="max-w-2xl">
                <h1 className="text-4xl font-semibold leading-tight tracking-normal text-[#191816] sm:text-5xl lg:text-6xl">
                  {appName}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-[#625d55] sm:text-lg">
                  Fold, launch, and land a tiny onchain paper trail. Every
                  action updates your flight log and the global loop counter on
                  Base.
                </p>
              </div>
            </header>

            <div className="grid gap-3 sm:grid-cols-3">
              {flightActions.map((action) => {
                const Icon = action.icon;
                const txStatus = txStatuses[action.id] ?? "idle";
                const disabled =
                  txStatus === "pending" || isSwitching || !hasContractAddress;

                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => void runAction(action)}
                    disabled={disabled}
                    className="group flex min-h-36 flex-col justify-between border border-[#cfc5b6] bg-[#fffaf0] p-4 text-left shadow-[5px_5px_0_rgba(42,148,201,0.16)] transition hover:-translate-y-0.5 hover:border-[#2a94c9] hover:shadow-[7px_7px_0_rgba(42,148,201,0.2)] disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xs text-[#d8423a]">
                        {action.route}
                      </span>
                      {txStatus === "pending" ? (
                        <Loader2 className="h-5 w-5 animate-spin text-[#2a94c9]" />
                      ) : txStatus === "success" ? (
                        <CheckCircle2 className="h-5 w-5 text-[#2f8c54]" />
                      ) : txStatus === "failed" ? (
                        <CircleAlert className="h-5 w-5 text-[#d8423a]" />
                      ) : (
                        <Icon className="h-5 w-5 text-[#2a94c9]" />
                      )}
                    </span>
                    <span className="text-xl font-semibold leading-7 text-[#191816]">
                      {action.label}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-[#625d55]">
                      {txStatus === "idle" ? "Ready" : txStatus}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setWalletMenuOpen((open) => !open)}
                className="flex min-h-12 w-full items-center justify-between gap-3 border border-[#191816] bg-[#191816] px-4 py-3 text-left font-medium text-[#fffdf8] transition hover:bg-[#2a2824] sm:w-auto sm:min-w-72"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Wallet className="h-5 w-5 shrink-0 text-[#83c7e6]" />
                  <span className="truncate">
                    {isConnected ? walletStatus : "Connect Wallet"}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </button>

              {walletMenuOpen ? (
                <div className="absolute bottom-14 left-0 z-20 w-full border border-[#cfc5b6] bg-[#fffdf8] p-2 shadow-[0_16px_38px_rgba(38,31,24,0.18)] sm:w-80">
                  {isConnected ? (
                    <button
                      type="button"
                      onClick={() => {
                        disconnect();
                        setWalletMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium text-[#191816] hover:bg-[#f0e8d8]"
                    >
                      <LogOut className="h-4 w-4 text-[#d8423a]" />
                      Disconnect wallet
                    </button>
                  ) : (
                    connectors.map((item) => (
                      <button
                        key={item.uid}
                        type="button"
                        onClick={() => void connectWallet(item.uid)}
                        disabled={isConnecting}
                        className="flex w-full items-center gap-3 px-3 py-3 text-left text-sm font-medium text-[#191816] hover:bg-[#f0e8d8] disabled:opacity-50"
                      >
                        <Wallet className="h-4 w-4 text-[#2a94c9]" />
                        {item.name}
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <aside className="relative grid content-start gap-4 border border-[#d9d1c3] bg-[#fffaf0]/90 p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.8)] sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-[#d9d1c3] pb-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#d8423a]">
                  Navigation Counts
                </p>
                <h2 className="mt-1 text-2xl font-semibold">Loop Ledger</h2>
              </div>
              <div className="font-mono text-xs text-[#625d55]">
                {isFetching || isLoading ? "Syncing" : "Live"}
              </div>
            </div>

            <div className="grid gap-3">
              <CountRow
                label="Folds"
                mine={counts.myFolds}
                total={counts.totalFolds}
              />
              <CountRow
                label="Launches"
                mine={counts.myLaunches}
                total={counts.totalLaunches}
              />
              <CountRow
                label="Landings"
                mine={counts.myLandings}
                total={counts.totalLandings}
              />
            </div>

            <div className="grid gap-3 border-t border-[#d9d1c3] pt-4 text-sm">
              <StatusLine label="Wallet Status" value={walletStatus} />
              <StatusLine
                label="ETH Balance"
                value={
                  balance
                    ? `${Number(formatEther(balance.value)).toFixed(5)} ETH`
                    : "Unavailable"
                }
              />
              <StatusLine
                label="Contract"
                value={
                  hasContractAddress ? shortAddress(contractAddress) : "Not set"
                }
              />
              <StatusLine
                label="Attribution"
                value={
                  hasAttributionDataSuffix
                    ? "ERC-8021 suffix ready"
                    : "Builder code pending"
                }
              />
            </div>

            <div className="border border-[#cfc5b6] bg-[#fffdf8] p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#625d55]">
                  Last Transaction
                </p>
                <StatusBadge status={lastTx.status} />
              </div>
              <p className="text-base font-semibold text-[#191816]">
                {lastTx.label}
              </p>
              <p className="mt-2 break-words text-sm leading-6 text-[#625d55]">
                {lastTx.message}
              </p>
              {lastTx.hash ? (
                <a
                  href={txLink(lastTx.hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex max-w-full font-mono text-xs text-[#2a638c] underline underline-offset-4"
                >
                  {shortAddress(lastTx.hash)}
                </a>
              ) : null}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function CountRow({
  label,
  mine,
  total,
}: {
  label: string;
  mine: bigint;
  total: bigint;
}) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border border-[#d9d1c3] bg-[#fffdf8] px-3 py-3">
      <span className="text-sm font-semibold text-[#191816]">{label}</span>
      <span className="text-right">
        <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#625d55]">
          My
        </span>
        <span className="font-mono text-lg font-semibold">
          {countText(mine)}
        </span>
      </span>
      <span className="text-right">
        <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#625d55]">
          Total
        </span>
        <span className="font-mono text-lg font-semibold">
          {countText(total)}
        </span>
      </span>
    </div>
  );
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(96px,0.6fr)_1fr] gap-3 border-b border-dashed border-[#d9d1c3] pb-2 last:border-b-0">
      <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#625d55]">
        {label}
      </span>
      <span className="min-w-0 break-words text-right font-medium text-[#191816]">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: TxStatus }) {
  const classes = {
    idle: "border-[#cfc5b6] text-[#625d55]",
    pending: "border-[#2a94c9] text-[#2a638c]",
    success: "border-[#2f8c54] text-[#2f8c54]",
    failed: "border-[#d8423a] text-[#d8423a]",
  };

  return (
    <span
      className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${classes[status]}`}
    >
      {status}
    </span>
  );
}

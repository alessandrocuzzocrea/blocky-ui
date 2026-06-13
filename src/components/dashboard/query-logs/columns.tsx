"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { LogEntry } from "~/server/logs/types";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge, type BadgeVariants } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

const CopyableCell = ({
  value,
  truncate = true,
  showTooltip = false,
}: {
  value: string;
  truncate?: boolean;
  showTooltip?: boolean;
}) => {
  const onCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const copyToClipboard = async () => {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = value;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback copy failed", err);
        }
        document.body.removeChild(textArea);
      }
      toast.success("Copied to clipboard", {
        description: value,
      });
    };

    void copyToClipboard();
  };

  const content = (
    <div className={cn("min-w-0", truncate && "max-w-50 truncate")}>
      {value}
    </div>
  );

  return (
    <div className="group flex items-center gap-1">
      {showTooltip ? (
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent>
              <p>{value}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        content
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={onCopy}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
};

export const columns: ColumnDef<LogEntry>[] = [
  {
    accessorKey: "requestTs",
    header: "Time",
    cell: ({ row }) => {
      const timestamp = row.original.requestTs;
      if (!timestamp) return null;
      // Postgres stores all timestamps in UTC
      // Display in browser's local timezone if possible
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        year: "2-digit",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
  {
    accessorKey: "clientName",
    header: "Client Name",
    cell: ({ row }) => {
      const clientName = row.original.clientName;
      if (!clientName) return null;
      return <CopyableCell value={clientName} />;
    },
  },
  {
    accessorKey: "questionName",
    header: "Domain",
    cell: ({ row }) => {
      const domain = row.original.questionName;
      if (!domain) return null;
      return <CopyableCell value={domain} showTooltip />;
    },
  },
  {
    accessorKey: "questionType",
    header: "Type",
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.original.reason;
      if (!reason) return null;

      const regex = /\((.*?)\)/;
      const match = regex.exec(reason);
      const tooltipText = match ? match[1] : null;
      const displayText = reason.replace(/\(.*?\)/, "").trim();

      const responseType = row.original.responseType;
      let tooltipContent = tooltipText;

      if (responseType === "RESOLVED") {
        tooltipContent = `Resolved by: ${tooltipText}`;
      } else if (responseType === "BLOCKED") {
        tooltipContent = `Group: ${tooltipText}`;
      }

      let badgeVariant: BadgeVariants = "outline";

      if (responseType === "BLOCKED") {
        badgeVariant = "destructive";
      } else if (responseType === "RESOLVED") {
        badgeVariant = "default";
      }

      const badge = <Badge variant={badgeVariant}>{displayText}</Badge>;

      if (!tooltipContent) {
        return badge;
      }

      return (
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger>{badge}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "durationMs",
    header: "Duration",
    cell: ({ row }) => {
      const duration = row.original.durationMs;
      const responseType = row.original.responseType;
      const isLocalResponse =
        responseType === "CACHED" ||
        responseType === "HOSTSFILE" ||
        responseType === "CUSTOMDNS" ||
        responseType === "BLOCKED" ||
        responseType === "SPECIAL" ||
        responseType === "FILTERED" ||
        responseType === "NOTFQDN";

      if (duration == null) {
        return null;
      }

      if (duration === 0 && isLocalResponse) {
        return <span className="text-muted-foreground">—</span>;
      }

      return `${duration}ms`;
    },
  },
];

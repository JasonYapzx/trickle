"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase";

// Track processed notifications to prevent duplicates
const processedNotifications = new Set();

export function WebhookListener() {
  // Use a ref to track if we've already subscribed
  const hasSubscribed = useRef(false);

  useEffect(() => {
    // Prevent duplicate subscriptions
    if (hasSubscribed.current) {
      console.log("Already subscribed, skipping...");
      return;
    }

    hasSubscribed.current = true;
    const supabase = createClient();

    console.log("WebhookListener initialized, setting up channel...");

    // Subscribe to new notifications
    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          console.log("Notification received:", payload);

          const notification = payload.new;
          
          // Check if we've already processed this notification
          const notificationId = notification.id;
          if (processedNotifications.has(notificationId)) {
            console.log(`Already processed notification ${notificationId}, skipping...`);
            return;
          }
          
          // Mark as processed to prevent duplicates
          processedNotifications.add(notificationId);

          // Extract transaction details
          const data = notification.data;
          const txHash = data?.txHash || data?.hash;
          const eventType = data?.eventType || "Transaction";
          const from = data?.from || "Unknown";
          const to = data?.to || "Unknown";
          const status = data?.status || "pending";

          // Customize notification based on transaction type
          if (status === "included") {
            console.log("Transaction data for toast:", {
              txHash,
              eventType,
              from,
              to,
              status,
              rawData: data,
            });
            toast.success(`Transaction Confirmed`, {
              id: `tx-${txHash}`, // Add unique ID to prevent duplicates
              description: `Tx ${txHash.substring(0, 6)}...${txHash.substring(
                txHash.length - 4
              )} has been confirmed`,
              icon: "✅",
              action: txHash
                ? {
                    label: "View Details",
                    onClick: () =>
                      window.open(
                        `https://basescan.org/tx/${txHash}`,
                        "_blank"
                      ),
                  }
                : undefined,
              duration: 8000,
              className: "transaction-toast",
              style: { backgroundColor: "#f0fff4", borderColor: "#68d391" },
            });
          } else if (status === "failed") {
            toast.error(`Transaction Failed`, {
              description: `${eventType} transaction could not be completed`,
              icon: "❌",
              action: txHash
                ? {
                    label: "View Details",
                    onClick: () =>
                      window.open(
                        `https://basescan.org/tx/${txHash}`,
                        "_blank"
                      ),
                  }
                : undefined,
              duration: 10000,
            });
          } else {
            toast.info(`New ${eventType}`, {
              description: txHash
                ? `Transaction ${txHash.substring(0, 6)}...${txHash.substring(
                    txHash.length - 4
                  )} is processing`
                : "New blockchain event received",
              icon: "🔄",
              action: txHash
                ? {
                    label: "Track",
                    onClick: () =>
                      window.open(
                        `https://basescan.org/tx/${txHash}`,
                        "_blank"
                      ),
                  }
                : undefined,
              duration: 5000,
            });
          }

          // Mark notification as read
          supabase
            .from("notifications")
            .update({ read: true })
            .eq("id", notification.id)
            .then(({ error }) => {
              if (error)
                console.error("Error marking notification as read:", error);
            });
        }
      )
      .subscribe();

    console.log("Channel subscribed");

    // Cleanup subscription
    return () => {
      console.log("Cleaning up WebhookListener");
      supabase.removeChannel(channel);
      hasSubscribed.current = false;
    };
  }, []);

  return null;
}

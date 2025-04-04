/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    console.log("Webhook received");
    const webhookData = await req.json();
    console.log("Webhook body:", webhookData);

    // Process each notification in the webhook array
    for (const notification of Array.isArray(webhookData) ? webhookData : [webhookData]) {
      // Extract relevant transaction data
      const processedData = {
        eventId: notification.id || '',
        eventType: notification.event || '',
        txHash: notification.data?.tx?.hash || '',
        from: notification.data?.from || '',
        to: notification.data?.tx?.to || '',
        status: notification.data?.status || '',
        blockNumber: notification.data?.blockNumber || '',
        timestamp: notification.data?.updatedAt || new Date().toISOString()
      };

      // Store the processed data in Supabase
      const supabase = createClient();
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'transaction',
          data: processedData,
          read: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error storing notification:", error);
      }
    }

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 200,
    });
  }
}

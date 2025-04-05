/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Webhook received");
    const body = await req.json();
    console.log("Webhook body type:", Array.isArray(body) ? "Array" : "Object");

    // Store the webhook data in Supabase
    const supabase = createClient();
    
    // Handle both array and object formats
    if (Array.isArray(body)) {
      // If it's an array, insert each item separately
      const insertPromises = body.map(item => 
        supabase.from('notifications').insert({
          type: 'transaction',
          data: item,
          read: false,
          created_at: new Date().toISOString()
        })
      );
      
      const results = await Promise.all(insertPromises);
      const errors = results.filter(result => result.error).map(result => result.error);
      
      if (errors.length > 0) {
        console.error("Errors storing notifications:", errors);
      }
    } else {
      // If it's a single object, insert it directly
      const { error } = await supabase
        .from('notifications')
        .insert({
          type: 'transaction',
          data: body,
          read: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error storing notification:", error);
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 200 });
  }
}

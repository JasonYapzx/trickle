import { NextRequest, NextResponse } from "next/server";


// 1inch route init
export async function GET(req: NextRequest) {
  return NextResponse.json({
    "code": 200,
    "message": "OK"
  });
}
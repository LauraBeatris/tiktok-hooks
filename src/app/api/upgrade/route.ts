import { NextResponse } from "next/server";
import { autumn, getCustomerId } from "@/lib/autumn";

const PRO_PLAN_ID = "pro";

export async function POST(request: Request) {
  const customerId = await getCustomerId();
  const successUrl = `${new URL(request.url).origin}/?upgraded=1`;

  try {
    const { paymentUrl } = await autumn.billing.attach({
      customerId,
      planId: PRO_PLAN_ID,
      successUrl,
    });

    return NextResponse.json({ url: paymentUrl ?? successUrl });
  } catch (error) {
    console.error("Upgrade failed", error);
    return NextResponse.json({ error: "upgrade_failed" }, { status: 500 });
  }
}

import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const VALID_TAGS = ["products", "collections", "categories", "regions", "orders", "carts"]

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const tags: string[] = Array.isArray(body.tags) ? body.tags : VALID_TAGS

  for (const tag of tags) {
    if (VALID_TAGS.includes(tag)) {
      revalidateTag(tag)
    }
  }

  return NextResponse.json({ revalidated: true, tags })
}

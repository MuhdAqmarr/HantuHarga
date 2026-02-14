import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // RLS handles ownership + is_default check, but let's give a clear error
  const { data: template } = await supabase
    .from("basket_templates")
    .select("id, user_id, is_default")
    .eq("id", id)
    .single();

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  if (template.is_default) {
    return NextResponse.json(
      { error: "Cannot delete default templates" },
      { status: 403 }
    );
  }

  if (template.user_id !== user.id) {
    return NextResponse.json(
      { error: "You can only delete your own templates" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("basket_templates")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

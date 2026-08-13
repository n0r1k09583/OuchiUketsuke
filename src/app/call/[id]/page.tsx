"use client";

import { Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CallRoom } from "@/components/CallRoom";
import type { CallRole } from "@/lib/types";

function CallInner() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const role: CallRole = search.get("role") === "admin" ? "admin" : "visitor";
  return <CallRoom callId={params.id} role={role} />;
}

export default function CallPage() {
  return (
    <Suspense fallback={<div className="min-h-full flex-1 bg-navy-deep" />}>
      <CallInner />
    </Suspense>
  );
}

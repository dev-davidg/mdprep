import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "../lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TestConfig() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [count, setCount] = useState(10);

  useEffect(() => { if (count < 1) setCount(1); }, [count]);

  async function start() {
    // Create a session row
    const { data, error } = await supabase.from("sessions").insert({
      mode: "test",
      total_questions: count,
      correct_count: 0,
      score_fraction: 0,
      started_at: new Date().toISOString()
    }).select("id").single();
    if (!error && data?.id) {
      navigate(`/test/${data.id}/run`);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Configure Test</h1>
      <div className="space-y-2">
        <Label htmlFor="qty">Number of questions</Label>
        <Input id="qty" type="number" min={1} max={200} value={count} onChange={(e) => setCount(parseInt(e.target.value || "1", 10))} />
      </div>
      <Button onClick={start}>Start</Button>
    </div>
  );
}

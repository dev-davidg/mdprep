import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ModePicker() {
  const { categoryId } = useParams();
  return (
    <section className="max-w-lg mx-auto space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Choose mode</h1>
      <p className="text-muted-foreground">Select how you want to study this subject.</p>
      <div className="flex justify-center gap-3 pt-4">
        <Link to={`/learn/${categoryId}`}><Button size="lg">Learning</Button></Link>
        <Link to={`/test/${categoryId}/config`}><Button size="lg" variant="outline">Test</Button></Link>
      </div>
    </section>
  );
}

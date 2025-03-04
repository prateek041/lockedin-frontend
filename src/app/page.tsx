import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto">
      <h1>This is the dashboard page</h1>
      <Link href="/problem/1">
        <Button>Problem Page</Button>
      </Link>
    </div>
  );
}

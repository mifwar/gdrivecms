import { Button } from "@/components/ui/button";

import Link from "next/link";

export default function Home() {
  return (
    <div>
      <div className="bg-red-200">home page</div>

      <Link href={"/resume"} target="_blank">
        <Button>Resume</Button>
      </Link>
    </div>
  );
}

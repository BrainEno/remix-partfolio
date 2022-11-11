import { Link } from "@remix-run/react";

export default function WorkIndexPage() {
  return (
    <p>
      No work selected. Select a work on the left, or{" "}
      <Link to="new" className="text-blue-500 underline">
        create a new work.
      </Link>
    </p>
  );
}

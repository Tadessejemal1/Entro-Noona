import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const message = url.searchParams.get("message") || "An unknown error occurred.";
  return { message };
};

export default function ErrorPage() {
  const data = useLoaderData<{ message: string }>();

  return (
    <div>
      <h1>Error</h1>
      <p>{data?.message || "An unknown error occurred."}</p>
    </div>
  );
}

export default async function DailyDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const resolvedParams = await params;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Daily Log: {resolvedParams.date}</h1>
    </div>
  );
}

export default async function NoteDetailPage({ params }: { params: Promise<{ noteId: string }> }) {
  const { noteId } = await params;
  return <div><h1>Note: {noteId}</h1></div>;
}

export default function NoteDetailPage({ params }: { params: { noteId: string } }) {
  return <div><h1>Note: {params.noteId}</h1></div>;
}

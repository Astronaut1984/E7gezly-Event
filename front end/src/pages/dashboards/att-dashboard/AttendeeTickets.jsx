export default function AttendeeTickets() {
  async function getTickets() {
    const request = await fetch(
      "http://localhost:8000/attendeeUtils/gettickets",
      {
        credentials: "include",
      }
    );

    const data = await request.json();
    console.log(data);
  }

  return (
    <>
      <main className="w-full flex justify-center items-center flex-col">
        <h1 className="text-3xl font-bold mt-5">My Tickets</h1>
      </main>
    </>
  );
}

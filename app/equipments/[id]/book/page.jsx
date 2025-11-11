import { BookEquipmentClient } from "./BookEquipmentClient";

export default async function Page({ params }) {
  // ✅ Unwrap the Promise safely
  const { id } = await params;

  // Decode the equipment name (since Next encodes URL params)
  const equipmentName = decodeURIComponent(id);

  // Pass it to the client component
return <BookEquipmentClient equipmentId={equipmentName} />;
}

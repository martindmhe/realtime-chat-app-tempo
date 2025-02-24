import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Room {
  id: string;
  name: string;
  created_at: string;
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel = supabase
      .channel("room_members")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "room_members" },
        () => {
          fetchRooms();
        },
      )
      .subscribe();

    fetchRooms();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function fetchRooms() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("room_members")
        .select("rooms(*)")
        .eq("user_id", user.id);

      if (error) throw error;

      // Transform the data to get just the room objects
      const roomList = data?.map((item) => item.rooms) || [];
      setRooms(roomList);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  }

  return { rooms, loading };
}

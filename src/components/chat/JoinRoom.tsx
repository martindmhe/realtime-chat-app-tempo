import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function JoinRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    async function joinRoom() {
      if (!roomId) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // Check if room exists
        const { data: room } = await supabase
          .from("rooms")
          .select("*")
          .eq("id", roomId)
          .single();

        if (!room) {
          toast({
            variant: "destructive",
            title: "Room not found",
            description: "This room may have been deleted",
          });
          navigate("/");
          return;
        }

        // Check if already a member
        const { data: existingMember } = await supabase
          .from("room_members")
          .select("*")
          .eq("room_id", roomId)
          .eq("user_id", user.id)
          .single();

        if (!existingMember) {
          // Join the room
          const { error: joinError } = await supabase
            .from("room_members")
            .insert([{ room_id: roomId, user_id: user.id }]);

          if (joinError) throw joinError;

          toast({
            title: "Joined room",
            description: `Successfully joined ${room.name}`,
          });
        }

        navigate("/");
      } catch (error) {
        console.error("Error joining room:", error);
        toast({
          variant: "destructive",
          title: "Error joining room",
          description: error.message || "An unknown error occurred",
        });
        navigate("/");
      }
    }

    joinRoom();
  }, [roomId, navigate, toast]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Joining room...</h2>
        <p className="text-muted-foreground">
          Please wait while we add you to the room
        </p>
      </div>
    </div>
  );
}

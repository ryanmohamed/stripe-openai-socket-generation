import { UserData } from "@/context/SocketContext";
import useRoomContext from "@/hooks/useRoomContext";
import { Key } from "react";
import MemberLink from "../server/MemberLink";

const MemberStatusTile = ({ user, status, ...props }: { user: UserData | undefined, status: boolean }) => {
    return (
        <div className={`flex items-center justify-between w-full`} {...props}>
            <div className="inline-flex items-center">
                <img className="rounded-full w-8 h-8 p-1 mr-2 ring-2 ring-green-500" src={user?.image || "https://placeholder.co/500/500"} />
                <p>{user?.name}</p>
            </div>
            <p className={`${status ? "text-green-600" : "text-red-600"}`}>{status ? "Answered" : "Waiting"}</p>
        </div>
    );
}

export default function QuestionStatus() {
    const { roomData } = useRoomContext();
    if (!roomData || !roomData.userCurrentAnswerStatuses) 
        return <div>error</div>

    const columns = Object.entries(roomData.userCurrentAnswerStatuses).length;
    return (
        <div className={` w-full h-full p-2`}>
            { Object.entries(roomData.userCurrentAnswerStatuses)
                .map(([key, value], idx: number) => {
                    const user = roomData.members.find(member => member?.id === key);
                    return (
                        <MemberStatusTile user={user} status={value} key={key}/>
                    );
                }) 
            }
        </div>
    );
}
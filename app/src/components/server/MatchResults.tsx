import { ResultType, UserData } from "@/context/SocketContext";
import MatchResultsWireframe from "../wireframes/MatchResultsWireframe";
import ImageGeneration from "./ImageGeneration";

interface MatchResultsProps {
    results?: ResultType | null | undefined;
    members?: UserData[];
};

export default function MatchResults ({ results, members }: MatchResultsProps) {
    if(!results || !members) return <MatchResultsWireframe />
    return (
        <>
            <div className="mt-8 self-center">
                <ImageGeneration members={members} src={results.data?.data[0].url} alt="image" />
            </div>
            <div className="h-fit w-full p-2 rounded-2xl bg-stone-50">
                <div className="w-full h-full border-2 border-stone-300 rounded-2xl p-4 bg-stone-100">
                <h1 className="text-xl text-stone-800 border-b-2 border-stone-200 w-fit mb-4">Match Conlusion</h1>
                <p className="text-lg text-stone-400">{results.explanation}</p>
                </div>
            </div>
        </>
    );
}
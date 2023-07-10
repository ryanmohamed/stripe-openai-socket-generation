import ImageGenerationWireframe from "./ImageGenerationWireframe";

export default function MatchResultsWireframe () {
    return (
        <div className="animate-pulse">
            <div className="mt-8 self-center">
                <ImageGenerationWireframe />
            </div>
            <div className="h-fit w-full p-2 rounded-2xl bg-stone-50">
                <div className="w-full h-full border-2 border-stone-300 rounded-2xl p-4 bg-stone-100">
                <h1 className="text-xl text-stone-800 border-b-2 border-stone-200 w-fit mb-4">Match Conlusion</h1>
                <p className="h-3 w-full mb-2 bg-stone-400"></p>
                <p className="h-3 w-full mb-2 bg-stone-400"></p>
                <p className="h-3 w-full mb-2 bg-stone-400"></p>
                <p className="h-3 w-4/5  bg-stone-400"></p>
                </div>
            </div>
        </div>
    );
}
import { api } from "@/utils/api";
 
const TokenCount = () => {
    const query = api.controller.getBalance.useQuery();
    return (
        <div className="flex items-center rounded-full px-3 border-2 border-stone-500 bg-stone-950">
            <span className="text-stone-500 font-bold h-full mr-4">Tokens</span>
            <div className="centered">
                <span className="text-stone-500 font-bold mr-1">{query.data?.balance || 0}</span>
                <div className="centered text-stone-800 text-xs h-4 w-4 rounded-full border-[4px] border-yellow-500 bg-amber-500"></div>
            </div>
        </div> 
    );
}

export default TokenCount;
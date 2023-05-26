import Link from "next/link";

const Pricing = () => {
    return (
        <div className="w-full flex p-10 m-0">
            <ul className="w-full centered flex-col md:flex-row flex-wrap">
                
                <Link href="/" className="m-2">
                    <li className="price-tile border-red-600"> 
                        <div className="flex flex-col">
                            <h2 className="price-tile-h2 text-red-600">Free Bundle</h2>
                            <ul className="price-tile-ul">
                                <li className="mb-1">Free to play with an AI</li>
                                <li className="mb-1">3 tokens per month.</li>
                                <li className="mb-1">Access to community.</li>
                                <li className="mb-1">Interact with community posts.</li>
                                <li className="mb-1 line-through">Public facing account.</li>
                                <li className="mb-1 line-through">Post directly to your socials.</li>
                                <li className="mb-4 line-through">Custom themes</li>
                            </ul>
                        </div>
                        <button className="price-tile-btn bg-red-800"><span className="price-tile-span">Try Now</span></button>
                    </li>
                </Link>

                <Link href="/" className="m-2">
                    <li className="price-tile border-yellow-800 flex flex-col items-center justify-between"> 
                        <div className="flex flex-col">
                            <h2 className="price-tile-h2 text-yellow-800">Legend Bundle</h2>
                            <ul className="price-tile-ul">
                                <li className="mb-1">Free to play with an AI</li>
                                <li className="mb-1">12 tokens per month.</li>
                                <li className="mb-1">Access to community.</li>
                                <li className="mb-1">Interact with community posts.</li>
                                <li className="mb-1">Public facing account.</li>
                                <li className="mb-1 line-through">Post directly to your socials.</li>
                                <li className="mb-4 line-through">Custom themes</li>
                            </ul>
                        </div>
                        <button className="price-tile-btn bg-yellow-800"><span className="price-tile-span">$8/month</span></button>
                    </li>
                </Link>

                <Link href="/" className="m-2">
                    <li className="price-tile border-green-800"> 
                        <div className="flex flex-col">
                            <h2 className="price-tile-h2 text-green-800">Master Bundle</h2>
                            <ul className="price-tile-ul">
                                <li className="mb-1">Free to play with an AI</li>
                                <li className="mb-1">20 tokens per month.</li>
                                <li className="mb-1">Access to community.</li>
                                <li className="mb-1">Interact with community posts.</li>
                                <li className="mb-1">Public facing account.</li>
                                <li className="mb-1">Post directly to your socials.</li>
                                <li className="mb-4">Custom themes</li>
                            </ul>
                        </div>
                        <button className="price-tile-btn bg-green-800"><span className="price-tile-span">$15/month</span></button>
                    </li>
                </Link>

            </ul>
        </div>
    );
}

export default Pricing;
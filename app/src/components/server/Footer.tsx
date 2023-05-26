import Link from "next/link";

const Footer = () => {
    return (
        <footer className="w-full p-10 md:px-20 bg-stone-950">
            <h1 className="mb-6 text-5xl font-poppins font-semibold text-stone-500">Petmatcher</h1>
            <nav className="flex flex-col md:flex-row px-4 font-barlow text-stone-600">
                <ul className="mr-10 md:mr-20 text-lg mb-6">
                    <h1 className="text-xl md:text-2xl mb-2 w-fit border-b-2 border-stone-800">Contact</h1>
                    <li className="text-base md:text-lg w-fit transition hover:brightness-125 subpixel-antialiased"><Link href="mailto:reyaznyc@gmail.com">Email</Link></li>
                    <li className="text-base md:text-lg w-fit transition hover:brightness-125 subpixel-antialiased"><Link href="https://www.linkedin.com/in/ryan-mohamed-41a253189/">LinkedIn</Link></li>
                </ul>
                <ul className="mr-10 md:mr-20 text-lg mb-6">
                    <h1 className="text-xl md:text-2xl mb-2 w-fit border-b-2 border-stone-800">Other Web Apps</h1>
                    <li className="text-base md:text-lg w-fit transition hover:brightness-125 subpixel-antialiased"><Link href="https://ryanmohamed.netlify.app">Portfolio</Link></li>
                    <li className="text-base md:text-lg w-fit transition hover:brightness-125 subpixel-antialiased"><Link href="https://quizitiv.netlify.app">Quizitiv</Link></li>
                    <li className="text-base md:text-lg w-fit transition hover:brightness-125 subpixel-antialiased"><Link href="https://petmatcher.netlify.app">Petmatcher v1</Link></li>
                </ul>
                <ul className="mr-10 md:mr-20 text-lg">
                    <h1 className="text-xl md:text-2xl mb-2 w-fit border-b-2 border-stone-800">Contribute</h1>
                    <li className="text-base md:text-lg w-fit transition hover:brightness-125 subpixel-antialiased"><Link href="mailto:reyaznyc@gmail.com">Email</Link></li>
                    <li className="text-base md:text-lg w-fit transition hover:brightness-125 subpixel-antialiased"><Link href="https://github.com/ryanmohamed">Github</Link></li>
                </ul>
            </nav>
        </footer>
    );
}

export default Footer;
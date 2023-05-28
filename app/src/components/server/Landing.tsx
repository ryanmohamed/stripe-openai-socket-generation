import LandingExample from "./LandingExample";

const Landing = () => {
    return (
        <div className="w-full min-h-96 p-4 md:px-20 md:py-20 flex flex-col md:flex-row items-center justify-between">
          <div className="flex-grow p-6 md:p-10 mt-20 my-10 text-center">
            <h1 className=" text-stone-50 text-4xl font-poppins font-semibold antialiased">Welcome to Petmatcher</h1>
            <p className="text-stone-200 px-6 font-poppins">Your new favorite AI and socket powered team generation service.</p>
          </div>
          <LandingExample />
        </div>
    );
}

export default Landing;
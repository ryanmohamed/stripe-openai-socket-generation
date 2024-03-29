import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import Landing from "@/components/server/Landing";
import ActiveUsers from "@/components/server/ActiveUsers";
import Pricing from "@/components/server/Pricing";
import Footer from "@/components/server/Footer";

import { useContext } from "react";
import { SocketContext } from "@/context/SocketContext";
import Button from "@/components/Button";

const AuthContainer = () => {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-2xl text-white">
        {hello.data ? hello.data.greeting : "Loading tRPC query..."}
      </p>
      <AuthShowcase />
    </div>
  );
}

const Home: NextPage = () => {

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="page">
        <Landing />
        <div className="w-full mt-8 md:mt-2 px-10 flex-col md:flex-row-reverse centered">
          <h3 className="text-white text-center font-barlow m-6">Other users waiting to generate!</h3>
          <ActiveUsers  />
        </div>
        <Pricing />
        <div>

        <Footer />
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined },
  );

  return (
    <div className="">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

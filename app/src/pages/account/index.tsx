import ProfileHeader from "@/components/client/ProfileHeader";
import { type NextPage } from "next";
import Head from "next/head";

const Profile: NextPage = () => {
  
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="page">
        <ProfileHeader />
      </main>
    </>
  );
};

export default Profile;
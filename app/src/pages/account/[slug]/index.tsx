import ProfileHeader from "@/components/client/ProfileHeader";
import { type NextPage } from "next";
import Head from "next/head";
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import { prisma } from "@/server/db";

type UserInfo = {

};

// runs on server side, never in browser
export const getServerSideProps: GetServerSideProps<{
    user: any;
  }> = async (context) => {
    const userId = context.query.slug || "";
    const user = await prisma.user.findUnique({
        where: { 
            id: userId as string
        }
    });
    return { props: { user } };
};

const Page = ({
    user,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      <Head>
        <title>{user.name}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="page p-8">
        <ProfileHeader user={user}/>
      </main>
    </>
  );
};

export default Page;
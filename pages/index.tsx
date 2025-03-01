import type { NextPage } from 'next';
import Head from 'next/head';
import SnakeGame from '../components/SnakeGame';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Snake Game</title>
        <meta name="description" content="A self-thinking snake game created with Next.js and TypeScript" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center items-center min-h-screen">
        <SnakeGame />
      </main>
    </>
  );
};

export default Home;
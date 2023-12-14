import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div
      className="flex flex-col min-h-screen"
    >
      <div className="flex flex-row justify-between items-center p-8">
        <div
          className="flex flex-row justify-center items-center"
        >
          <img
            src="/icon.svg"
            alt="logo"
            className="w-10 h-10"
          />
          <h1
            className="text-3xl font-semibold ml-2"
          >Dunbar</h1>
        </div>
      </div>
      <div
        className="flex flex-col flex-grow justify-center items-center"
      >
        <div
          className="flex flex-col xl:flex-row justify-center items-center xl:mt-8"
        >
          <img
            src="/landing.svg"
            className="xl:absolute xl:w-96 xl:left-8 xl:-mt-32 xl:-z-10 -rotate-45 xl:rotate-0 -mt-64"
          />
          <div
            className="flex flex-col justify-center items-center xl:my-0 my-8"
          >
          <h1
            className="text-5xl font-semibold text-center"
          >Trade your tribe</h1>
          <p
            className="text-xl text-center mt-4 text-gray-400 font-medium"
          >Mint and trade your friends on Dunbar</p>
            <a
              href="https://tally.so/r/3jlgXJ"
              target="_blank"
              rel="noreferrer"
              className="mt-6 text-white font-semibold py-4 px-8 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-500 focus:ring-0"
            >
              <button>Join the waitlist</button>
            </a>
          </div>
          <img
            src="/landing.svg"
            className="xl:absolute xl:right-8 xl:-mt-32 xl:-z-10 hidden xl:block"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>
      </div>
    </div>
  )
}

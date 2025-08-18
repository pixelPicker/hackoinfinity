import Link from "next/link";
import { Logo } from "@/app/ui/components/logo";
import { spaceGrotesk } from "@/app/ui/fonts";
import clsx from "clsx";
import Image from "next/image";
import {
  IconPencilBolt,
  IconPlayerPlay,
  IconTrophy,
} from "@tabler/icons-react";

export default function Home() {
  return (
<<<<<<< HEAD
    <div className="min-h-screen w-full bg-[#fff8f0] relative">
=======
    <div className="min-h-screen w-full bg-white relative">
>>>>>>> upstream/master
      <div className="absolute top-1/15 left-1/2 -translate-1/2"><Logo /></div>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(255, 182, 153, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 244, 214, 0.5) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(255, 182, 153, 0.1) 0%, transparent 50%)`,
        }}
      />
      <Hero />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center text-center">
      <h1
        className={clsx(
          "text-6xl font-extrabold text-Primary-Text tracking-tight",
          spaceGrotesk.className
        )}
      >
        Create. Collaborate.{" "}
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-Accent to-Accent-Dark">
          Doodle Together.
        </span>
      </h1>
      <p className="mt-5 text-lg text-gray-700 max-w-2xl">
        DoodleSquad is your online collaborative whiteboard where ideas come to
        life. Sketch, brainstorm, and co-create with your team in real-time.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
<<<<<<< HEAD
          href="/"
=======
          href="/whiteboard"
>>>>>>> upstream/master
          className={clsx(
            "text-black font-medium cursor-pointer text-lg flex items-center gap-2 border-[6px] z-[2] border-white/50 bg-clip-padding rounded-full px-10 py-3 bg-no-repeat bg-gradient-to-br from-Accent to-Accent-Dark",
            "before:content[''] before:w-full before:h-full before:absolute relative before:top-[5px] before:left-[5px] before:rounded-full before:blur-lg before:bg-gradient-to-t before:from-Accent before:to-transparent before:-z-10",
            "after:content[''] after:w-full after:h-full after:absolute relative after:top-[5px] after:left-[5px] after:rounded-full after:blur-lg after:bg-gradient-to-t after:from-transparent after:to-Accent"
          )}
        >
          Start Drawing <IconPencilBolt />
        </Link>
        <Link
          href="/"
          className={clsx(
            "text-Secondary-Text font-medium cursor-pointer text-lg flex items-center gap-2 border-[6px] z-[2] border-white/50 bg-clip-padding rounded-full px-10 py-3 bg-no-repeat bg-transparent",
            "before:content[''] before:w-full before:h-full before:absolute relative before:top-[5px] before:left-[5px] before:rounded-full before:blur-lg before:bg-gradient-to-t before:from-Accent before:to-transparent before:-z-10",
            "after:content[''] after:w-full after:h-full after:absolute relative after:top-[5px] after:left-[5px] after:rounded-full after:blur-lg after:bg-gradient-to-t after:from-transparent after:to-Accent"
          )}
        >
          Try a Demo <IconPlayerPlay />
        </Link>
      </div>

      <div className="absolute bottom-[20px] cursor-pointer left-1/2 -translate-1/2 px-4 py-2 rounded-full bg-Secondary-Text/45 hover:bg-Secondary-Text/55 transition-all backdrop-blur-lg text-white flex items-center gap-2 ">
        <IconTrophy />
<<<<<<< HEAD
        <Link href="/leaderboard">Leaderboard</Link>
=======
        Leaderboard
>>>>>>> upstream/master
      </div>
      <Image
        src={"/heroicons/illustration1.svg"}
        alt="Illustration of brush and paint"
        width={180}
        height={180}
        className="absolute top-8/10 left-8/10 -translate-1/2"
      />
      <Image
        src={"/heroicons/illustration2.svg"}
        alt="Illustration of brush and paint"
        width={180}
        height={180}
        className="absolute top-2/10 left-9/10 -translate-1/2"
      />
      <Image
        src={"/heroicons/illustration3.svg"}
        alt="Illustration of brush and paint"
        width={180}
        height={180}
        className="absolute top-8/10 left-2/10 -translate-1/2"
      />
      <Image
        src={"/heroicons/illustration4.svg"}
        alt="Illustration of brush and paint"
        width={180}
        height={180}
        className="absolute top-2/10 left-1/10 -translate-1/2"
      />
    </section>
  );
}

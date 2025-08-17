import Image from "next/image";

export function Logo() {
    return <Image alt="DoodleSquad Logo" src={"/logo.svg"} className="pt-2" width={180} height={100}/>
}
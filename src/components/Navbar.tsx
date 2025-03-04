"use client"

import Link from "next/link"
import { ModeToggle } from "./theme-toggler"
import { Button } from "./ui/button"

const Navbar = () => {
  return (
    <div className="container mx-auto">
      <nav className="flex justify-between items-center">
        <div className="flex items-center gap-x-8">
          <h1 className="font-bold tracking-tighter lg:text-xl">
            LOCKEDIN
          </h1>
          <div className={"text-sm hover:text-primary cursor-pointer text-muted-foreground"}>
            <Link href="/problems">
              problems
            </Link>
          </div>
        </div>
        <div className="flex gap-x-2">
          <Button variant="outline">Dashboard</Button>
          <ModeToggle />
        </div>
      </nav>
    </div>
  )
}

export default Navbar

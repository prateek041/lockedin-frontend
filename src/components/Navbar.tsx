"use client";

import Link from "next/link";
import { ModeToggle } from "./theme-toggler";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  // Add scroll event listener to detect when to add blur effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 border-b transition-all duration-200",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-border"
          : "bg-background border-transparent"
      )}
    >
      <div className="container mx-auto">
        <nav className="flex justify-between items-center py-3">
          <div className="flex items-center gap-x-8">
            <h1 className="font-bold tracking-tighter lg:text-xl">LOCKEDIN</h1>
            <div className="text-sm hover:text-primary cursor-pointer text-muted-foreground">
              <Link href="/problems">problems</Link>
            </div>
          </div>
          <div className="flex gap-x-2">
            <Button variant="outline">Dashboard</Button>
            <ModeToggle />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Navbar;

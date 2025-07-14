"use client";

import Link from "next/link";
import Image from "next/image";

interface BookCoverProps {
  href: string;
  imageUrl: string;
  title: string;
  author: string;
}

export function BookCover({ href, imageUrl, title, author }: BookCoverProps) {
  return (
    <Link
      href={href}
      className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg"
    >
      <div
        className="bg-card p-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-2 border border-border"
        data-aos="fade-up"
      >
        <div className="aspect-[3/4] w-full relative mb-4">
          <Image
            src={imageUrl}
            alt={`Capa do livro ${title}`}
            layout="fill"
            objectFit="cover"
            className="rounded-md shadow-lg"
          />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-md text-primary truncate group-hover:text-primary-focus">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{author}</p>
        </div>
      </div>
    </Link>
  );
}

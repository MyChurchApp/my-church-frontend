"use client";

import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const VideoSection = () => {
  return (
    <section
      id="video"
      className="py-20 sm:py-24 bg-background dark:bg-background-alt"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4"
            data-aos="fade-up"
          >
            Veja o MyChurch em Ação
          </h2>
          <p
            className="text-lg text-text-secondary max-w-3xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Menos conversa, mais ação. Veja como a nossa plataforma é intuitiva,
            poderosa e bonita.
          </p>
        </div>
        <div
          className="max-w-4xl mx-auto"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden relative group">
            <img
              src="/placeholder.svg?height=720&width=1280"
              alt="Demonstração do MyChurch"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Button className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300">
                <Play className="text-4xl ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;

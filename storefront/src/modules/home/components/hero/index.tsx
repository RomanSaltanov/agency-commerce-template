import { Heading } from "@medusajs/ui"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80"
        alt="Fashion hero"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black/30 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-4xl leading-10 text-white font-semibold"
          >
            New Collection
          </Heading>
          <Heading
            level="h2"
            className="text-xl leading-10 text-white/80 font-normal mt-2"
          >
            Discover the latest styles
          </Heading>
        </span>
        <LocalizedClientLink href="/store">
          <button className="bg-white text-black px-8 py-3 text-sm font-medium hover:bg-white/90 transition-colors">
            Shop Now
          </button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Hero

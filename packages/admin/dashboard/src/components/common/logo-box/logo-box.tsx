import { clx } from "@medusajs/ui"
import { Transition, motion } from "motion/react"

type LogoBoxProps = {
  className?: string
  checked?: boolean
  containerTransition?: Transition
  pathTransition?: Transition
}

export const LogoBox = ({
  className,
  checked,
  containerTransition = {
    duration: 0.8,
    delay: 0.5,
    ease: [0, 0.71, 0.2, 1.01],
  },
  pathTransition = {
    duration: 0.8,
    delay: 0.6,
    ease: [0.1, 0.8, 0.2, 1.01],
  },
}: LogoBoxProps) => {
  return (
    <div
      className={clx(
        "bg-ui-button-neutral shadow-buttons-neutral relative flex size-14 items-center justify-center rounded-xl",
        "after:button-neutral-gradient after:inset-0 after:content-['']",
        className
      )}
    >
      {checked && (
        <motion.div
          className="absolute -right-[5px] -top-1 flex size-5 items-center justify-center rounded-full border-[0.5px] border-[rgba(3,7,18,0.2)] bg-[#3B82F6] bg-gradient-to-b from-white/0 to-white/20 shadow-[0px_1px_2px_0px_rgba(3,7,18,0.12),0px_1px_2px_0px_rgba(255,255,255,0.10)_inset,0px_-1px_5px_0px_rgba(255,255,255,0.10)_inset,0px_0px_0px_0px_rgba(3,7,18,0.06)_inset]"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={containerTransition}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <motion.path
              d="M5.8335 10.4167L9.16683 13.75L14.1668 6.25"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={pathTransition}
            />
          </svg>
        </motion.div>
      )}
      <svg
        width="36"
        height="36"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="300" height="300" fill="#1877F2" rx="36" />
        <g clipPath="url(#clip0_logobox)">
          <path d="M101.628 111.155C103.937 107.224 109.998 96.8065 115.097 88.004L124.367 72H139.836H155.305L171.616 104.508L187.927 137.015L179.569 150.804C174.972 158.389 171.064 164.596 170.885 164.6C170.706 164.603 168.673 160.9 166.368 156.371C164.063 151.841 157.529 139.186 151.849 128.247C146.169 117.308 141.043 107.313 140.458 106.034C139.873 104.756 139.254 103.718 139.083 103.726C138.911 103.736 137.252 106.46 135.395 109.78C133.538 113.1 128.086 122.669 123.279 131.044C118.472 139.419 112.377 150.047 109.733 154.661C107.09 159.276 102.927 166.541 100.482 170.805C98.0374 175.07 96.0367 178.775 96.0367 179.04C96.0367 179.305 100.318 179.528 105.55 179.534L115.064 179.547L120.991 191.072C124.25 197.41 127.011 202.858 127.125 203.178C127.253 203.537 112.08 203.761 87.6665 203.761C65.8503 203.761 48 203.584 48 203.368C48 203.152 48.5234 202.103 49.1622 201.037C49.8017 199.972 55.0439 190.989 60.8108 181.076C66.5783 171.163 75.2181 156.339 80.0112 148.135C84.8042 139.931 90.684 129.863 93.0778 125.761C95.4709 121.659 99.3188 115.086 101.628 111.155Z" fill="white" />
          <path d="M200.087 143.474C206.448 132.364 212.742 121.387 214.074 119.079L216.495 114.884H233.987H251.478L250.267 116.904C249.601 118.015 246.865 122.7 244.187 127.315C241.509 131.929 237.987 137.942 236.36 140.677C234.733 143.412 231.04 149.705 228.152 154.661C225.265 159.618 219.3 169.826 214.896 177.346C210.493 184.867 204.471 195.215 201.514 200.342C198.557 205.47 193.766 213.655 190.866 218.532L185.595 227.399L169.674 227.233L153.753 227.068L141.571 203.139C134.872 189.979 127.534 175.646 125.266 171.289L121.143 163.368L122.819 160.723C124.282 158.418 130.433 147.806 134.346 140.837L135.652 138.512L137.835 138.513L140.019 138.514L147.993 153.89C152.378 162.347 158.972 175.21 162.646 182.474C166.32 189.738 169.493 195.681 169.696 195.681C170.065 195.681 178.097 181.884 200.087 143.474Z" fill="white" />
        </g>
        <defs>
          <clipPath id="clip0_logobox">
            <rect width="204" height="156" fill="white" transform="translate(48 72)" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}

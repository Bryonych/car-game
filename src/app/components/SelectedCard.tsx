import { motion } from "framer-motion";
import { Card } from "../data/interfaces.tsx";

/**
 * Handles the animation of the card selected by the user.
 * Documentation from https://ui.aceternity.com/
 * @param Selected  The card the user has clicked on. 
 * @returns The selected card is expanded, brought forward and has the hidden text displayed.
 * @author Bryony Church
 */
const SelectedCard = ({ selected }: { selected: Card | null }) => {
    return (
      <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg shadow-2xl relative z-[60]">
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 0.6,
          }}
          className="absolute inset-0 h-full w-full bg-black opacity-60 z-10"
        />
        <motion.div
          layoutId={`content-${selected?.id}`}
          initial={{
            opacity: 0,
            y: 100,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            z: 100,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="relative px-8 pb-4 z-[70] text-white"
        >
          {selected?.content}
        </motion.div>
      </div>
    );
  };

  export default SelectedCard

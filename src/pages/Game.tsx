import React, { ReactElement, useEffect, useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { getTodaysCar } from '../data/getData.tsx';
import { Card } from "../data/interfaces.tsx";

function Game(): ReactElement {
    const [todaysImage, setTodaysImage] = useState<string>();
    const [selected, setSelected] = useState<Card | null>(null);
    const [lastSelected, setLastSelected] = useState<Card | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const handleClick = (card: Card) => {
        setLastSelected(selected);
        setSelected(card);
    };
    
    const handleOutsideClick = () => {
        setLastSelected(selected);
        setSelected(null);
    };

    useEffect(() => {
        createCards();
        if (todaysImage === undefined) {
            getTodaysCar().then(res => {
                setTodaysImage(res);
            });
        }
    }, []);

    useEffect(() => {
        console.log(cards)
        console.log(todaysImage);
        if (cards.length > 0 && todaysImage !== undefined) {
          setIsLoading(false);
        }
    }, [todaysImage, cards]);

    function createCards() {
      let createdCards = [];
      const colors = ["blue", "red", "green", "yellow", "orange", "gray", "pink", "brown", "black", "purple", "blue", "red", "green", "yellow", "orange"]
      for (let i = 0; i < 15; i++ ) {
        const c: Card = {
          "id":createdCards.length,
          "content": "Test content",
          "className": "",
          "thumbnail": "",
          "color": colors[createdCards.length]
        }
        createdCards.push(c);
      }
      setCards(createdCards);
    }

    return isLoading ? <div><p>waiting</p></div>
    : (
        <div className="relative w-full h-auto p-10 mt-20 ">
            <img className="absolute z-0 w-full h-full p-1" src={todaysImage} />
            <div className="w-full h-full grid grid-cols-3 mx-auto relative">
                {cards.map((card, i) => (
                    <div key={i} className={cn(card.className, "")}>
                    <motion.div
                        onClick={() => handleClick(card)}
                        className={cn(
                        card.className,
                        "relative overflow-hidden",
                        selected?.id === card.id
                            ? " cursor-pointer absolute inset-0 h-1/2 md:w-1/2 m-auto z-50 flex justify-center items-center flex-wrap flex-col"
                            : lastSelected?.id === card.id
                            ? "z-40 bg-white "
                            : "bg-white  "
                        )}
                        layoutId={`card-${card.id}`}
                        style={{height:"10vh", width:"full", background:card.color}}
                    >
                        {selected?.id === card.id && <SelectedCard selected={selected} />}
                        {/* <ImageComponent card={card} /> */}
                    </motion.div>
            </div>
                ))}
                 <motion.div
                    onClick={handleOutsideClick}
                    className={cn(
                    "absolute h-full w-full left-0 top-0 bg-black opacity-0 z-10",
                    selected?.id ? "pointer-events-auto" : "pointer-events-none"
                    )}
                    animate={{ opacity: selected?.id ? 0.3 : 0 }}
                />
            </div>
        </div>
    )
}

const ImageComponent = ({ card }: { card: Card }) => {
  return (
    <motion.img
      layoutId={`image-${card.id}-image`}
      // background-color="blue"
      src={card.thumbnail}
      height="500"
      width="500"
      className={cn(
        "object-cover object-top absolute inset-0 h-full w-full transition duration-200"
      )}
    />
  );
};

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
            y: 100,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="relative px-8 pb-4 z-[70]"
        >
          {selected?.content}
        </motion.div>
      </div>
    );
  };

export default Game
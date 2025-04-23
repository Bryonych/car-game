'use client'

import React, { ReactElement, useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { cn } from "../../lib/utils.ts";
import { getTodaysCar, getRandomNumbers } from './data/getData.tsx';
import { Card } from "./data/interfaces.tsx";
import { FormControl, Autocomplete, TextField } from "@mui/material";
import { Alert, Button } from '@mui/material';

function Game(): ReactElement {
    const [todaysImage, setTodaysImage] = useState<string>();
    const [todaysCarInfo, setTodaysCarInfo] = useState<string[]>([]);
    const [selected, setSelected] = useState<Card | null>(null);
    const [previouslySelected, setPreviouslySelected] = useState<Card[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selection, setSelection] = useState<string | null>("");
    const [guessOptions, setGuessOptions] = useState<string[]>([]);
    const [answer, setAnswer] = useState<string>("");
    const [numGuesses, setNumGuesses] = useState<number>(0);
    const [correct, setCorrect] = useState<boolean | undefined>(undefined);
    const [canGuess, setCanGuess] = useState<boolean>(false);
    const [finished, setFinished] = useState<boolean>(false);
    
    const handleClick = (card: Card | null) => {
        if (selected === null) {
          setSelected(card);
          setSelection("");
          setCorrect(undefined);
        } else {
          setPreviouslySelected([...previouslySelected, selected]);
          setSelected(null);
          if (!finished) {
            setNumGuesses(numGuesses+1);
          }
          if (!correct || correct === undefined) {
            setCanGuess(true);
          }
        }
    };

    const handleSubmit = () => {
      console.log(answer + " " + selection);
      if (answer !== "" && selection === answer) {
        setCorrect(true);
        setFinished(true);
      } else {
        setCorrect(false);
        setSelection("");
      }
      if (numGuesses == 15 && !correct) {
        setFinished(true);
      }
      setCanGuess(false);
    }

    const handleShare = (guessed: boolean) => {
      const text = guessed? "I guessed today's car after removing " + numGuesses + " blocks" :
              "I didn't guess today's car after removing 15 blocks";
      if (navigator.share) {
      navigator.share({
        title: "Car Game Result",
        text: text,
        url: "https://d1u0cr4tt1us5e.cloudfront.net/"
      }).catch((error) => console.log("Sharing failed", error));
      } else {
        alert("Sharing not supported on this browser");
      }
    }

    const filterOptions = (options: string[], { inputValue }: { inputValue: string }) => {
      return options
        .filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 50); // Limit results to 10
    };

    useEffect(() => {
        if (todaysImage === undefined) {
            const todaysDate = new Date().toLocaleString("en-GB");
            // let todaysDate = "04/04/2025";
            getTodaysCar(todaysDate).then(res => {
              setGuessOptions(res['carlist']);
              setTodaysImage(res['image']);
              const items: string[] = [];
              for (const [key, value] of Object.entries(res['cardata'])) {
                if (key !== "Year" && key !== "Model" && key !== "Make" && key !== "S3-Key" && key !== "Date") {
                  items.push(key + " :" + value);
                }
              }
              setTodaysCarInfo(items);
              setAnswer((res['cardata']['S3-Key']).replaceAll('-', ' '));
            });
        }
    }, []);

    useEffect(() => {
        createCards();
    }, [todaysCarInfo]);

    useEffect(() => {
        if (cards.length > 0 && todaysImage !== undefined) {
          setIsLoading(false);
        }
    }, [todaysImage, cards]);

    function createCards() {
      const createdCards = [];
      const colors = ["#D62246", "#8BA6A9", "#3A445D", "#E7BB41", "#DB995A", "#352208", "#B8D8D8", "#3772FF", "#0B6E4F", "#8491A3", "#F15152", "#470FF4", "#F7D488", "#92140C", "#2A1E5C"]
      const randomCards = getRandomNumbers(14,6);
      let idx = 0;
      for (let i = 0; i < 15; i++ ) {
        let content: string = "";
        if (randomCards.has(i) && idx < 6 && todaysCarInfo != undefined) {
          content = todaysCarInfo[idx];
          idx ++;
        }
        const c: Card = {
          "id":createdCards.length,
          "content": content,
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
      <div>
        <p className="flex justify-center font-serif text-blue-800 mt-15 sm:mt-9">Remove a block to make a guess</p>
        <div className="relative w-[80vw] h-full sm:w-[60vw] mt-6 flex justify-center items-center mx-auto">
            <img className="absolute z-0 w-full max-h-full p-1 inset-0" src={todaysImage} />
            <div className="w-full h-full min-h-0 grid grid-cols-5 sm:grid-cols-3 relative">
                {cards.map((card, i) => (
                    <div key={i} className={cn(card.className, "")}>
                    <motion.div
                        onClick={() => handleClick(card)}
                        title="block"
                        className={cn(
                        card.className,
                        "relative overflow-hidden h-[8vh] sm:h-[11vh]",
                        selected?.id === card.id
                            ? "rounded-lg cursor-pointer absolute inset-0 h-1/2 md:w-1/2 m-auto z-50 flex justify-center items-center flex-wrap flex-col"
                            : previouslySelected.includes(card)
                            ? "-z-40 bg-white"
                            : "bg-white "
                        )}
                        layoutId={`card-${card.id}`}
                        style={{ background:card.color}}
                    >
                        {selected?.id === card.id && <SelectedCard selected={selected} />}
                    </motion.div>
            </div>
                ))}
                 <motion.div
                    onClick={() => handleClick(null)}
                    className={cn(
                    "absolute h-full w-full left-0 top-0 bg-white opacity-0 z-10",
                    selected?.id ? "pointer-events-auto" : "pointer-events-none"
                    )}
                    animate={{ opacity: selected?.id ? 0.3 : 0 }}
                />
            </div>
        </div>
        <div className="flex justify-center items-center mx-auto m-5 sm:w-[70vw]">
          <div className="w-full max-w-md">
            <FormControl fullWidth>
              <Autocomplete
                options={guessOptions}
                filterOptions={filterOptions}
                renderInput={(params) => <TextField {...params} label="Guess" />}
                disabled={!canGuess || finished}
                onChange={(event, newValue: string | null) => { setSelection(newValue);}}
              >
              </Autocomplete>
            </FormControl>
          </div>
          <Button className="m-h-full self-stretch" variant="contained" disabled={selection===""} onClick={handleSubmit}>Submit</Button>
        </div>
        <div className="flex justify-center font-serif text-blue-800"><p>Number of blocks removed: {numGuesses}</p></div>
          {correct==false && !finished? <Alert severity="error">Incorrect. Try again</Alert> :
            correct==false && finished? <div className="flex justify-center mt-5 sm:mt-1">
              <Alert severity="info">Hard luck. The correct answer was {answer}</Alert> 
              <Button variant="contained" onClick={() => handleShare(false)}>Share</Button>
              </div>: 
            finished? <div className="flex justify-center mt-5 sm:mt-1">
              <Alert severity="success">Correct! You guessed {answer} correctly after removing {numGuesses} blocks</Alert> 
              <Button variant="contained" onClick={() => handleShare(true)}>Share</Button>
              </div>: <></>}
      </div>
    )
}

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

export default Game
'use client'

import React, { ReactElement, useEffect, useState } from 'react';
import { motion } from "framer-motion";
import { cn } from "../../lib/utils.ts";
import { getTodaysCar, getRandomNumbers } from './data/getData.tsx';
import { Tile, TileColors } from "./data/interfaces.tsx";
import SelectedTile from "./components/SelectedTile.tsx";
import { FormControl, Autocomplete, TextField, Container, Grid2, Chip, Box } from "@mui/material";
import Image from 'next/image';
import { Alert, Button } from '@mui/material';
import { localStateStore } from './data/handleLocalState.tsx';

/**
 * Represents the single-page game.
 * @returns The game object to display to the user.
 */
function Game(): ReactElement {
    const [todaysImage, setTodaysImage] = useState<string>();
    const [todaysDate, setTodaysDate] = useState<string>();
    const [todaysCarInfo, setTodaysCarInfo] = useState<string[]>([]);
    const [selected, setSelected] = useState<Tile | null>(null);
    const [previouslySelected, setPreviouslySelected] = useState<number[]>([]);
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selection, setSelection] = useState<string | null>("");
    const [guessOptions, setGuessOptions] = useState<string[]>([]);
    const [answer, setAnswer] = useState<string>("");
    const [numGuesses, setNumGuesses] = useState<number>(0);
    const [correct, setCorrect] = useState<boolean | undefined>(undefined);
    const [canGuess, setCanGuess] = useState<boolean>(false);
    const [finished, setFinished] = useState<boolean>(false);
    
    /**
     * When a tile is clicked by the user, sets the clicked tile as the selected if no tile
     * is already selected. If a tile was already selected, sets it to previously selected and 
     * sets selected to null, increases the count of tile removed, then changes the canGuess flag, 
     * so that the user can make a guess.
     * @param tile The tile the user has clicked on.
     */
    const handleClick = (tile: Tile | null) => {
        console.log(correct + " " + finished);
        if (selected === null) {
          setSelected(tile);
          setSelection("");
          // Set correct flag to undefined, so user can make a guess after next click
          if (!correct) setCorrect(undefined);
        } else {
          setPreviouslySelected([...previouslySelected, selected.id]);
          setSelected(null);
          if (!finished) {
            setNumGuesses(numGuesses+1);
          }
          if (!correct || correct === undefined) {
            // Set can guess flag to enable the drop down list
            setCanGuess(true);
          }
        }
    };

    /**
     * When the submit button is clicked, check if answer is correct and 
     * update states accrodingly.
     */
    const handleSubmit = () => {
      // console.log(answer + " " + selection);
      if (answer !== "" && selection === answer) {
        // If they got the right answer
        setCorrect(true);
        setFinished(true);
      } else {
        // Wrong answer
        setCorrect(false);
        setSelection("");
      }
      if (numGuesses == 15 && !correct) {
        // No more guesses available, so game is over
        setFinished(true);
      }
      // Disable drop down until next tile is removed
      setCanGuess(false);
    }

    /**
     * Creates a shareable object for sharing the results of the game.
     * @param guessed   Boolean for whether they guessed correctly or not.
     */
    const handleShare = (guessed: boolean) => {
      const text = guessed? "I guessed today's car after removing " + numGuesses + " blocks" :
              "I didn't guess today's car after removing 15 blocks";
      if (navigator.share) {
      navigator.share({
        title: "Car Game Result",
        text: text,
        url: "https://d1u0cr4tt1us5e.cloudfront.net/" // need to update with domain once created
      }).catch((error) => console.log("Sharing failed", error));
      } else {
        alert("Sharing not supported on this browser");
      }
    }

    /**
     * Filters the dropdown list based on charcters entered by the user
     * @param options     The cars in the car list
     * @param inputValue  The text entered by the user    
     * @returns 
     */
    const filterOptions = (options: string[], { inputValue }: { inputValue: string }) => {
      return options
        .filter((option) => option.toLowerCase().includes(inputValue.toLowerCase()))
        .slice(0, 500); // Limit results to 500
    };

    // On load, either load the store state from their browser, or get the date from the user's 
    // browser and retreive the image and car data for this date from the backend.
    useEffect(() => {
        loadState();
        if (todaysImage === undefined) {
            const date = new Date().toLocaleString("en-GB")
            setTodaysDate(date);
            // setTodaysDate("04/04/2025");
            getTodaysCar(date).then(res => {
              if (res !== undefined) {
                setGuessOptions(res['carlist']);
                setTodaysImage(res['image']);
                const items: string[] = [];
                for (const [key, value] of Object.entries(res['cardata'])) {
                  if (key !== "Model" && key !== "Make" && key !== "S3-Key" && key !== "Date") {
                    items.push(key + " :" + value);
                  }
                }
                setTodaysCarInfo(items);
                setAnswer((res['cardata']['S3-Key']).replaceAll('-', ' '));
              }
            });
        }
    }, []);

    // Creates the tiles once todays car data has been retrieved.
    useEffect(() => {
        createTiles();
    }, [todaysCarInfo]);

    // Once car data is retrieved and tiles are created, displays the game
    useEffect(() => {
      if (tiles.length > 0 && todaysImage !== undefined) {
        setIsLoading(false);
      }
    }, [todaysImage, tiles]);

    // Saves the state after a guess is made or the game is finished
    useEffect(() => {
      saveState();
    }, [correct, finished]);

    /**
     * Creates 15 cards to appear over the image and randomly adds clues to the content
     * of 7 of them from the retrieved car data. 
     */
    function createTiles() {
      const createdTiles = [];
      const randomTiles = getRandomNumbers(14,7);
      let idx = 0;
      for (let i = 0; i < 15; i++ ) {
        let content: string = "";
        if (randomTiles.has(i) && idx < 7 && todaysCarInfo != undefined) {
          content = todaysCarInfo[idx];
          idx ++;
        }
        const c: Tile = {
          "id":createdTiles.length,
          "content": content,
          "className": "",
          "thumbnail": "",
          "color": TileColors[createdTiles.length]
        }
        createdTiles.push(c);
      }
      setTiles(createdTiles);
    }

    /**
     * Retrieves the state from local storage and, if it matches todays date, loads
     * the state variables, otherwise deletes it.
     */
    function loadState() {
      const stored = localStateStore.getItem();
      const date = (new Date().toLocaleString("en-GB")).substring(0,10);
      if (stored === null) return;
      const storedObj = JSON.parse(stored);
      if (storedObj['todaysDate'] && (storedObj['todaysDate']).substring(0,10) === date) {
        setPreviouslySelected(storedObj['previouslySelected']);
        setNumGuesses(storedObj['previouslySelected'].length);
        setFinished(storedObj['finished']);
        setCorrect(storedObj['correct']);
      } else {
        localStateStore.removeItem();
      }
    }

    /**
     * Creates and stores the state of the game in local storage
     */
    function saveState() {
      const state = {
        previouslySelected: previouslySelected,
        finished: finished,
        correct: correct,
        todaysDate: todaysDate
      }
      localStateStore.setItem(JSON.stringify(state));
    }

    return isLoading ? <div><p>Loading...</p></div>
    : (
      <Container>
        <p className="flex justify-center text-blue-800 mt-15 sm:mt-9">Remove a tile to make a guess</p>
        <div className="relative w-[80vw] h-full sm:w-[60vw] mt-6 flex justify-center items-center mx-auto">
            <Image className="absolute z-0 w-full max-h-full p-1 inset-0" src={todaysImage!} alt="Image" width={500} height={300} />
            <Grid2 className="w-full h-full min-h-0 grid grid-cols-5 sm:grid-cols-3 relative">
                {tiles.map((tile, i) => (
                  <div key={i} className={cn(tile.className, "")}>
                    <motion.div
                        onClick={() => handleClick(tile)}
                        title="tile"
                        className={cn(
                        tile.className,
                        "relative overflow-hidden h-[8vh] sm:h-[11vh]",
                        selected?.id === tile.id
                            ? "rounded-lg cursor-pointer absolute inset-0 h-1/2 md:w-1/2 m-auto z-50 flex justify-center items-center flex-wrap flex-col"
                            : previouslySelected.includes(tile.id)
                            ? "-z-40 bg-white"
                            : "bg-white "
                        )}
                        layoutId={`card-${tile.id}`}
                        style={{ background:tile.color}}
                    >
                        {selected?.id === tile.id && <SelectedTile selected={selected} />}
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
            </Grid2>
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
          <Button className="m-h-full self-stretch" variant="contained" color="primary" disabled={selection===""} onClick={handleSubmit}>Submit</Button>
        </div>
          <Chip 
            sx={{ display: 'flex',alignItems: 'center', justifySelf: 'center' }} 
            label={<Box>Tiles removed: {numGuesses}</Box>} 
            color="primary"/>
          {correct==false && !finished? <div className="flex justify-center mt-5 sm:mt-1">
            <Alert severity="error">Incorrect. Try again</Alert> 
            </div>:
            correct==false && finished? <div className="flex justify-center mt-5 sm:mt-1">
              <Alert severity="info">Hard luck. The correct answer is {answer}. Try again tomorrow</Alert> 
              <Button variant="contained" color="primary" onClick={() => handleShare(false)}>Share</Button>
              </div>: 
            correct && finished? <div className="flex justify-center mt-5 sm:mt-1">
              <Alert severity="success">Correct! You guessed {answer} correctly after removing {numGuesses} tiles</Alert> 
              <Button variant="contained" color="primary" onClick={() => handleShare(true)}>Share</Button>
              </div>: <></>}
      </Container>
    );
}

export default Game
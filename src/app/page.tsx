'use client'

import React, { ReactElement, useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from "framer-motion";
import { cn } from "../../lib/utils.ts";
import { getTodaysCar, getRandomNumbers } from './data/getData.tsx';
import { Tile, TileColors, Accreditation } from "./data/interfaces.tsx";
import SelectedTile from "./components/SelectedTile.tsx";
import { FormControl, Autocomplete, TextField, Container, Grid2, Chip, Box, CircularProgress } from "@mui/material";
import Image from 'next/image';
import { Alert, Button, IconButton, Dialog } from '@mui/material';
import { localStateStore } from './data/handleLocalState.tsx';
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

/**
 * Represents the single-page game.
 * @returns The game object to display to the user.
 */
function Game(): ReactElement {
    const [todaysImage, setTodaysImage] = useState<string>();
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [todaysDate, setTodaysDate] = useState<string>();
    const [todaysCarInfo, setTodaysCarInfo] = useState<string[]>([]);
    const [selected, setSelected] = useState<Tile | null>(null);
    const [previouslySelected, setPreviouslySelected] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selection, setSelection] = useState<string | null>("");
    const [guessOptions, setGuessOptions] = useState<string[]>([]);
    const [answer, setAnswer] = useState<string>("");
    const [numGuesses, setNumGuesses] = useState<number>(0);
    const [correct, setCorrect] = useState<boolean | undefined>(undefined);
    const [canGuess, setCanGuess] = useState<boolean>(false);
    const [finished, setFinished] = useState<boolean>(false);
    const [accreditation, setAccreditaion] = useState<Accreditation>();
    const [error, setError] = useState<string>();
    const [clickedWhenNotLoaded, setClickedWhenNotLoaded] = useState<Tile | null>();
    const [shouldLoadImage, setShouldLoadImage] = useState(false);
    const [displayInfo, setDisplayInfo] = useState<boolean>(false);
    
    /**
     * When a tile is clicked by the user, sets the clicked tile as the selected if no tile
     * is already selected. If a tile was already selected, sets it to previously selected and 
     * sets selected to null, increases the count of tile removed, then changes the canGuess flag, 
     * so that the user can make a guess.
     * @param tile The tile the user has clicked on.
     */
    const handleClick = (tile: Tile | null) => {
        if (selected === null) {
          // If user clicks a tile before the image has loaded display loading element
          if (!imageLoaded) {
            setClickedWhenNotLoaded(tile);
          }
          else {
            setSelected(tile);
            setSelection("");
            // Set correct flag to undefined, so user can make a guess after next click
            if (!correct) setCorrect(undefined);
          }
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
    }

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
     * Creates and stores the state of the game in local storage
     */
    const saveState = useCallback(() => {
      const state = {
        previouslySelected: previouslySelected,
        finished: finished,
        correct: correct,
        todaysDate: todaysDate
      }
      localStateStore.setItem(JSON.stringify(state));
    },[previouslySelected, finished, correct, todaysDate]);

    /**
     * Creates a shareable object for sharing the results of the game.
     * @param guessed   Boolean for whether they guessed correctly or not.
     */
    const handleShare = (guessed: boolean) => {
      const frontCar = String.fromCodePoint(0x1F698);
      const sideCar = String.fromCodePoint(0x1F697);
      const text = guessed? frontCar + " I guessed the car for " + todaysDate + " after removing " + numGuesses + " tiles " + frontCar :
              sideCar + " I didn't guess the car for " + todaysDate + " after removing 15 tiles " + sideCar;
      if (navigator.share) {
      navigator.share({
        title: "Car Game Result",
        text: text,
        url: "https://revealthewheels.com" 
      }).catch((error) => console.log("Sharing failed", error));
      } else {
        alert("Sharing not supported on this browser");
      }
    }

    /** 
      * Creates 15 tiles to appear over the image and randomly adds clues to the content
      * of 7 of them from the retrieved car data. 
      */
    const tiles = useMemo(() => {
      const createdTiles = [];
      const frontCar: string = String.fromCodePoint(0x1F698);
      const randomTiles = getRandomNumbers(14,7);
      let idx = 0;
      for (let i = 0; i < 15; i++ ) {
        let content: string = frontCar + " No clue here " + frontCar;
        if (randomTiles.has(i) && idx < 7 && todaysCarInfo !== undefined) {
          if (todaysCarInfo[idx] !== undefined) {
            content = "Hint: vehicle's " + todaysCarInfo[idx];
          }
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
      return createdTiles;
    }, [todaysCarInfo]);

    // On load, either load the store state from their browser, or get the date from the user's 
    // browser and retreive the image and car data for this date from the backend.
    useEffect(() => {
        loadState();
        if (todaysImage === undefined) {
            const date = new Date().toLocaleString("en-GB").substring(0,10);
            setTodaysDate(date);
            getTodaysCar(date).then(res => {
              if (res !== undefined) {
                setGuessOptions(res['carlist']);
                setTodaysImage(res['image']);
                if ("Image-Credit" in res['cardata']) {
                  setAccreditaion(res['cardata']['Image-Credit']);
                }
                const items: string[] = [];
                // Ignore the fields that aren't hints and convert the ones that are to appropriate string
                for (const [key, value] of Object.entries(res['cardata'])) {
                  let data = value;
                  if (typeof data === "string") data = data.toString().toLowerCase();
                  if (key !== "Model" && key !== "Make" && key !== "S3-Key" && key !== "Date" && key !== "Image-Credit") {
                    if (key === "Cylinders") items.push(" number of cylinders is " + data);
                    else if (key === "Vehicle-Size-Class") items.push(" size class is " + data);
                    else items.push(key.toLowerCase().replace(/-/g, " ") + " is " + data);
                  }
                }
                setTodaysCarInfo(items);
                setAnswer((res['cardata']['S3-Key']).replaceAll('-', ' '));
              } else {
                setError("Sorry! We haven't been able to load a car for today. Try again later...");
              }
            });
            if ('requestIdleCallback' in window) {
              requestIdleCallback(() => setShouldLoadImage(true));
            } else {
              setTimeout(() => setShouldLoadImage(true), 500);
            }
        }
        // Only checking todaysImage for undefined
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Once tiles are created, displays the game
    useEffect(() => {
      if (tiles.length > 0 && error === undefined) setIsLoading(false);
      else if (error) setIsLoading(true);
    }, [tiles, error]);

    // Once the image is loaded, check if a tile has already been clicked. If it has, remove loading element
    // and handle click
    useEffect(() => {
      if (clickedWhenNotLoaded !== undefined && imageLoaded) {
        const clicked = clickedWhenNotLoaded;
        setClickedWhenNotLoaded(undefined);
        setSelected(clicked);
        setSelection("");
        // Set correct flag to undefined, so user can make a guess after next click
        if (!correct) setCorrect(undefined);
      }
    }, [clickedWhenNotLoaded, imageLoaded, correct]);

    // Removes all the tiles after a correct guess and saves the state 
    // after a guess is made or the game is finished
    useEffect(() => {
      if (correct && finished && previouslySelected.length != tiles.length) {
        tiles.forEach((tile, idx) => {
          if (!previouslySelected.includes(tile.id)) {
            setTimeout(() => {
              setPreviouslySelected(previouslySelected => [...previouslySelected, tile.id]);
            }, idx*100);
          }
        });
        saveState();
      }
    }, [correct, finished, previouslySelected, tiles, saveState]);



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

    return isLoading && error === undefined? 
      <div className="h-screen flex items-center justify-center">
        <CircularProgress color="success" /></div>
    : isLoading && error ? 
      <div className="h-screen flex items-center justify-center px-5">
        <p>{error}</p></div>
    : (
      <Container className="min-h-screen">
        <h1 className="flex justify-center text-lg font-bold text-blue-800 mt-10 sm:mt-7">
          Reveal the Wheels</h1>
        <div className="flex justify-center mb-7 sm:mb-4">
          <div className="inline-flex items-center gap-2">
            <p className="text-blue-800 whitespace-nowrap">Remove a tile to make a guess</p>
            <IconButton 
              title="info-button"
              size="small" 
              className="bg-gray-300 text-gray-800 w-7 h-7 border border-gray-400 shadow-sm"
              aria-label="More information"
              onClick={() => {setDisplayInfo(true);}}>
                <InfoOutlinedIcon fontSize="small"/>
            </IconButton>
          </div>
        </div>
        {displayInfo ? 
        <Dialog title="dialog" open={displayInfo} onClose={() => setDisplayInfo(false)}>
          <div className="p-6 max-w-md">
            <h2 className="text-xl font-bold mb-4">How to Play</h2>
            <p className="mb-4">
              Each day, a new car image is revealed behind 15 tiles. Your goal is to guess the make and model of the car by removing tiles to reveal the car.
            </p>
            <ul className="list-disc list-inside mb-4">
              <li>Click on a tile to remove it and reveal a clue and part of the car.</li>
              <li>After removing a tile, you can make a guess from the dropdown menu.</li>
              <li>If your guess is incorrect, you can remove another tile and try again.</li>
              <li>You have a maximum of 15 tiles to remove. Use them wisely!</li>
            </ul>
            <p className="mb-4">
              Good luck and have fun guessing the car of the day!
            </p>
            </div>
        </Dialog> : <></>}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
          <Chip
            label={<Box>Tiles removed: {numGuesses}</Box>} 
            color="primary"/>
        </Box>
        <div className="relative w-[80vw] h-full sm:w-[50vw] mt-6 flex justify-center items-center mx-auto">
            {shouldLoadImage && todaysImage !== undefined ? 
              <Image 
                className="absolute z-0 w-full max-h-full p-1 inset-0" 
                src={todaysImage!} 
                alt="Image" 
                width={500} 
                height={300} 
                onLoad={() => setImageLoaded(true)}
              />
              : <></>}
            <Grid2 className="w-full h-full min-h-0 grid grid-cols-5 sm:grid-cols-3 relative">
                {tiles.map((tile, i) => (
                  clickedWhenNotLoaded === tile ? <div className="flex justify-center items-center" key={i}>
                    <CircularProgress color="success"/></div> :
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
                        style={{ background:tile.color }}
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
                    animate={{ opacity: selected?.id ? 0.8 : 0 }}
                />
            </Grid2>
        </div>
        {accreditation && (numGuesses > 0 || finished)?
        <div className="flex justify-end mx-auto w-[80vw] sm:w-[50vw] text-xs text-blue-700">
          <a href={accreditation.Link}>{accreditation.ImageName}</a>, &nbsp;
          {accreditation.ImageLicence? <a href={accreditation.ImageLicence}>{accreditation.LicenceName}</a> :
          <p>{accreditation.LicenceName}</p> }
        </div> : <></> }
        <div className="flex justify-center items-center mx-auto m-5 sm:w-[70vw]">
          <div className="w-full max-w-md bg-white">
            <FormControl fullWidth>
              <Autocomplete
                options={guessOptions}
                slotProps={{popper:{placement: 'top'}}}
                renderInput={(params) => <TextField {...params} label="Guess" />}
                disabled={!canGuess || finished}
                onChange={(event, newValue: string | null) => { setSelection(newValue);}}
              >
              </Autocomplete>
            </FormControl>
          </div>
          <Button className="m-h-full self-stretch" variant="contained" color="primary" disabled={selection===""} onClick={handleSubmit}>Submit</Button>
        </div>
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
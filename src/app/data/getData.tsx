/**
 * Retrieves the car image, the car data and the list of possible cars from the backend.
 * @param date  The current date from the user's browser
 * @returns     An oject containing the image URL, the list of cars and the car data.
 */
export async function getTodaysCar(date: string)  {
    const api = process.env.API_URL;
    // console.log("API: " + api);
    try {
        const res = await fetch(api! + "?date=" + date);
        const resJson = await res.json();
        const carData = {
            "image": resJson.image, // Now a direct URL
            "carlist": (resJson.carlist).sort(),
            "cardata": resJson.cardata
        }
        return carData;
    } catch (error) {
        console.log("Unable to fetch today's car from DB:", error);
        return undefined;
    }
}


/**
 * Returns a list of 'total' random numbers between 0 and end.
 * @param end       The highest number to be added
 * @param total     The number of random numbers to be returned
 * @returns 
 */
export function getRandomNumbers(end: number, total: number) {
    const numSet: Set<number> = new Set();
    while (numSet.size < total) {
        numSet.add(Math.floor(Math.random() * end));
    }
    return numSet;
}
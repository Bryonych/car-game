/**
 * Retrieves the car image, the car data and the list of possible cars from the backend.
 * @param date  The current date from the user's browser
 * @returns     An oject containing the image URL, the list of cars and the car data.
 */
export async function getTodaysCar(date: string) {
    const url = process.env.URL ?? '/api';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ date }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.log("Error retreiving car data: ",  errorData);
            return undefined;
        }
        const data = await response.json();
        data.carlist = data.carlist.sort();
        return data;
    } catch (error) {
        console.error("Unable to retrieve car data: ", error);
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
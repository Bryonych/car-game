/**
 * Retrieves the car image, the car data and the list of possible cars from the backend.
 * @param date  The current date from the user's browser
 * @returns     An oject containing the image URL, the list of cars and the car data.
 */
export async function getTodaysCar(date: string) {
    let formatDate;
    if (date[0] === ',') formatDate = date.substring(0,11);
    else formatDate = date.substring(0,10);
    const api = process.env.API_URL;
    // console.log("API: " + api);
    try {
        const res = await fetch(api! + "?date=" + formatDate);
        const resJson = await res.json();
        const imgBlob = base64ToBlob(resJson.image);
        const imageObjectURL = URL.createObjectURL(imgBlob);
        const carData = {
            "image": imageObjectURL,
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
 * Converts the base64 string of the image to a Blob object.
 * @param base64    The base64 representation of the image 
 * @returns         The image converted to a Blob
 */
export function base64ToBlob(base64: string) {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let i = 0; i < byteCharacters.length; i += 512) {
        const slice = byteCharacters.slice(i, i + 512);
        const byteNumbers = new Array(slice.length);
        for (let j = 0; j < slice.length; j++) {
            byteNumbers[j] = slice.charCodeAt(j);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: "image/jpeg" });
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
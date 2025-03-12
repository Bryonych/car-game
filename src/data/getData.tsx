import { CarData } from './interfaces';

export async function getTodaysCar() {
    const api = process.env.API_URL;
    console.log(api);
    const res = await fetch(api!);
    const resJson = await res.json();
    const imgBlob = base64ToBlob(resJson.image);
    const imageObjectURL = URL.createObjectURL(imgBlob);
    const carData = {
        "image": imageObjectURL,
        "carlist": resJson.carlist,
        "cardata": resJson.cardata
    }
    return carData;
}

function base64ToBlob(base64: string) {
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

export function getRandomNumbers(end: number, total: number) {
    const numSet = new Set();
    while (numSet.size <= total) {
        numSet.add(Math.floor(Math.random() * end));
    }
    return numSet;
}

export async function getTodaysCar() {
    // Need to update URL for deployment
    const api = 'https://x02ge7ylrf.execute-api.ap-southeast-2.amazonaws.com/dev/car'
    const res = await fetch(api);
    const imageBlob = await res.blob();
    const imageObjectURL = URL.createObjectURL(imageBlob);
    return imageObjectURL;
}
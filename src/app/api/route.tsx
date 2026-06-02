import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const date  = await request.json().then(data => data.date);
    const api = process.env.API_URL;
    try {
        const res = await fetch(api! + "?date=" + date);
        const resJson = await res.json();
        const carData = {
            "image": resJson.image, // Now a direct URL
            "carlist": resJson.carlist,
            "cardata": resJson.cardata
        }
        return NextResponse.json(carData);
    } catch (error) {
        console.log("Unable to fetch today's car from DB:", error);
        return NextResponse.json({ error: 'Failed to fetch car data' }, { status: 500 });
    }
}
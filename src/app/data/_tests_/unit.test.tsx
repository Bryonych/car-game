import { expect, it } from '@jest/globals';
import { getTodaysCar, getRandomNumbers, base64ToBlob } from '../getData';
import { JetBrains_Mono } from 'next/font/google';
import { Buffer } from "buffer";

describe('Get data tests', () => {

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should return car data when api call is successful", async () => {
        const imageFile = "123456789";
        const encoded = Buffer.from(imageFile, 'binary').toString('base64');
        const mockData = { 
            "image": encoded,
            "carlist": ["carone", "cartwo"], 
            "cardata": { "Make": "Test Make", "Model": "Test Model", "Year": 1983 }
        }
        const date = "19/03/2025";

        jest.spyOn(global, "fetch").mockResolvedValue({
            ok: true, 
            json: async () => (mockData),
        } as unknown as Response);

        const result = await getTodaysCar(date);
        expect(result["carlist"]).toEqual(mockData["carlist"]);
        expect(result["cardata"]).toEqual(mockData["cardata"]);
        expect(result["image"]).toContain("blob");
        expect(result["image"]).not.toEqual(mockData["image"]);
        expect(global.fetch).toHaveBeenCalledWith(process.env.API_URL + "?date=19/03/2025");
    });

    
})
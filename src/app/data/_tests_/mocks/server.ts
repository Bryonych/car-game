import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";


const mockResponse = {
    "image": "test.url/toimage.jpg",
    "carlist": ["cartwo", "carone"],
    "cardata": {
        "Make": "test make",
        "Model": "test model",
        "Year": 1983
    }
}
export const server = setupServer(
  http.get("https://api.test.com/car", async () => {
    return HttpResponse.json(mockResponse);
  })
);


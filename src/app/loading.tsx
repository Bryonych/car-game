
import { CircularProgress } from "@mui/material";

export default function Loading() {
    return <div className="h-screen flex items-center justify-center">
                <CircularProgress color="success" />
            </div>
}
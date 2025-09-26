import { ConvexReactClient } from "convex/react";

// Hardcoded for production deployment
const convexUrl = "https://wry-goldfinch-589.convex.cloud";

const convex = new ConvexReactClient(convexUrl);

export default convex;
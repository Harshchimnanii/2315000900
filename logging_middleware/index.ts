import { LogStackType, LogLevelType, LogPackageType, LogPayload } from './types';

/**
 * Unique Approach: 
 * We use an AbortController to ensure the logging API call doesn't hang the client network.
 * We also fetch the auth token dynamically.
 */
const LOG_API_ENDPOINT = "http://4.224.186.213/evaluation-service/logs";

// Helper function to dynamically get the Bearer token
// (Tujhe apna token localStorage ya jahan bhi save kiya h wahan se nikalna hai)
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token'); 
  }
  return null;
};

export const Log = async (
  stack: LogStackType,
  level: LogLevelType,
  pkg: LogPackageType,
  message: string
): Promise<void> => {
  
  // 1. Construct the exact payload requested
  const payload: LogPayload = {
    stack,
    level,
    package: pkg,
    message,
  };

  const token = getAuthToken();
  if (!token) {
    console.warn("Client Logger: Authorization token is missing. Log not sent to server.");
    return; // Token nahi h toh API call mat kar, faltu error aayega
  }

  // 2. Setup a timeout (e.g., 5 seconds) so our app doesn't wait forever
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(LOG_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // Intentionally not using alert or throwing error to prevent UI crash
      console.error(`Client Logger: Server responded with status ${response.status}`);
    } else {
      // Optional: Log to local console in development mode
      if (process.env.NODE_ENV !== 'production') {
         console.log(`[${level.toUpperCase()}] ${pkg}: ${message}`);
      }
    }
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      console.warn("Client Logger: API request timed out.");
    } else {
      console.error("Client Logger: Failed to send log to server.", error);
    }
  }
};
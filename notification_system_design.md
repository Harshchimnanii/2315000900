# Stage 1: Priority Inbox System Design

## Approach to Priority Calculation
To determine the top 'n' most important unread notifications efficiently, we employ a **Two-Tiered Heuristic Sorting Algorithm**:

1. **Categorical Weighting (Primary Sort):** We assign a predefined numerical magnitude to each notification type based on its critical business value to the student. 
   - `Placement` = Weight 3 (Highest Priority)
   - `Result` = Weight 2
   - `Event` = Weight 1

2. **Chronological Decay / Recency (Secondary Sort):** If two notifications fall under the same category (e.g., two "Placement" updates), the tie is resolved using their UNIX timestamps. The algorithm prioritizes the more recent timestamp (descending order).

## Handling Continuous Flow (Scale & Maintenance)
To handle a continuous influx of new notifications efficiently without a dedicated database:
- **Client-Side/Middleware Filtering:** We fetch the batch, apply our $O(N \log N)$ sorting algorithm, and immediately slice the top 'n' records. 
- **Viewed State Management:** Since we cannot use a DB, the "read/unread" state is persisted in the client's `localStorage` as a Set of viewed IDs. This ensures that once a priority notification is clicked, it visually demotes to a "viewed" state and is filtered out of the unread priority queue.
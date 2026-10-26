QuickNotes System Design & Architecture1. RequirementsFunctional Requirements:Users can create, read, update, and delete notes (CRUD).
Users can tag notes and filter notes by tag.Users receive instantaneous loading of their notes feed.
Asynchronous background operations process secondary metadata (e.g., search indexing, analytics, or automated backups).
Non-Functional Requirements:High Availability: 99.9% uptime for core note access.Low Latency: Under 100 ms response time for read operations (GET /notes).Scalability: System horizontally scales to handle peak loads without performance degradation.
Data Integrity & Durability: Zero data loss for saved notes (ACID compliance).2. Load & Storage Estimates (1 Million Active Users)AssumptionsDaily Active Users (DAU): 1,000,000 users/dayRead Activity: 
Each active user loads their notes 20 times/day $\rightarrow$ $20,000,000 \text{ reads/day}$Write Activity: Each active user creates/edits 5 notes/day $\rightarrow$ $5,000,000 \text{ writes/day}$Average Note Size: 2 KB text content per note 
Calculations 
Read Throughput (QPS):$$\frac{20,000,000 \text{ reads}}{86,400 \text{ seconds}} \approx 231.5 \text{ reads/sec (Average)}$$$$\text{Peak Read QPS (2x)} \approx 463 \text{ reads/sec}$$Write Throughput (QPS):$$\frac{5,000,000 \text{ writes}}{86,400 \text{ seconds}} \approx 57.87 \text{ writes/sec (Average)}$$$$\text{Peak Write QPS (2x)} \approx 115.7 \text{ writes/sec}$$Storage Requirements per Year:$$5,000,000 \text{ notes/day} \times 2 \text{ KB} = 10,000,000 \text{ KB/day} = 10 \text{ GB/day}$$$$10 \text{ GB/day} \times 365 \text{ days} = 3.65 \text{ TB/year}$$

System Architecture Diagram
                             [ Client App / Web ]
                                      |
                               ( DNS Lookup )
                                      v
                                  [  DNS  ]
                                      |
                                      v
                                  [  CDN  ] (Static UI Assets)
                                      |
                                      v
                             [ Load Balancer ]
                               /             \
                              v               v
                     [ App Server 1 ]   [ App Server 2 ]
                       /     |     \     /     |     \
                      /      |      \   /      |      \
                     v       |       v v       |       v
       +-----------------+   |   +--------+    |   +---------------+
       | Cache Cluster   |   |   | Queue  |    |   | Primary DB    |
       | (Redis)         |   |   +--------+    |   | (Writes)      |
       +-----------------+   |        |        |   +---------------+
                             |        v        |           |
                             |   [ Worker ]    |           v
                             |                 |   +---------------+
                             +-----------------+-> | Read Replicas |
                                                   +---------------+
4. Component Responsibilities
Client: Renders the application UI and sends HTTP/HTTPS API requests on behalf of the user.

DNS (Domain Name System): Resolves the domain name (e.g., api.quicknotes.com) into public IP addresses for network routing.

CDN (Content Delivery Network): Caches static frontend assets (HTML, CSS, JS bundles) close to users globally to minimize page load latency.

Load Balancer: Distributes incoming HTTP requests across multiple application server nodes to prevent server overload and eliminate single points of failure.

App Servers (App Server 1 & 2): Runs application logic, validates client inputs, verifies user authentication, and orchestrates database and cache operations.

Cache (Redis): Stores pre-computed user timelines and recent notes in memory to serve read requests with sub-millisecond latency.

Primary Database (Write): Persists authoritative core user and note data transactionally.

Read Replicas: Handles offloaded read traffic from the primary database to maintain fast query response times.

Queue: Holds asynchronous events (such as note indexing or notification triggers) to decouple heavy background processing from API response times.

Worker: Consumes events from the queue asynchronously to perform tasks like updating full-text search indexes or building user metrics.

5. Step-by-Step Data Flow
Flow 1: GET /notes (Read Notes)
Client Request: The user opens QuickNotes, sending a GET /notes request containing their Bearer authentication token.

Routing: The request passes through DNS, CDN, and Load Balancer, which forwards it to an available App Server.

Cache Lookup: The App Server queries the Cache (Redis) using the user's ID.

Cache Hit: If notes are present in Redis, the App Server returns the notes array as a 200 OK JSON response immediately.

Cache Miss: If Redis does not contain the data, the App Server queries a Read Replica Database, populates the Cache with the retrieved result, and returns 200 OK JSON to the client.

Flow 2: POST /notes (Create Note)
Client Request: The user submits the note form, sending a POST /notes request with a JSON payload ({ "title": "...", "body": "..." }).

Validation: The App Server receives the request, authenticates the token, and validates that title and body constraints are met.

Primary Write: The App Server writes the new note record into the Primary Database.

Cache Invalidation/Update: The App Server updates or invalidates the user's cached note list in Redis.

Async Queue Dispatch: The App Server places a NOTE_CREATED event onto the Queue for background processing and returns a 201 Created response to the client.

Async Worker Processing: A Worker pulls the event off the Queue to index the note in full-text search asynchronously.

6. System Reliability & Trade-offs
Single Point of Failure (SPOF) Mitigation
App Tier: Multiple App Servers run behind the Load Balancer with health checks; if one crashes, traffic routes to remaining nodes.

Database Tier: Automated failover is configured between the Primary Database and Read Replicas. If the Primary fails, a Read Replica is automatically promoted to Primary.

Load Balancer Tier: Active-passive dual Load Balancers with floating IP allocation ensure seamless failover if the active balancer goes down.

Architecture Trade-offs
Cache Invalidation vs. Read Latency:

Trade-off: Using a Cache-Aside pattern provides extremely fast reads (
O(1) lookup time), but introduces complex invalidation logic when updating notes. Stale data may briefly be returned if cache invalidation fails during write operations.

Synchronous Writes vs. Asynchronous Indexing:

Trade-off: Deferring full-text search indexing to a background queue keeps POST /notes request latencies ultra-low (< 50 ms), but means a newly created note might not be immediately discoverable in search results for a few seconds (eventual consistency).
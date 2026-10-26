REST API EndpointsMethodPathDescriptionSuccess StatusGET/api/v1/notesRetrieves a paginated list of notes for the authenticated user.200 OKPOST/api/v1/notesCreates a new note for the authenticated user.201 CreatedGET/api/v1/notes/{id}Retrieves a single note by its ID.200 OKPUT/api/v1/notes/{id}Updates all attributes of an existing note.200 OKPATCH/api/v1/notes/{id}Partially updates specific attributes (e.g., pinning or archiving) of a note.200 OKDELETE/api/v1/notes/{id}Permanently deletes a note by its ID.204 No Content

HTTP Error Status Codes
400 Bad Request: The request body or parameters are malformed, missing required fields, or fail validation rules (e.g., title exceeding 100 characters).

401 Unauthorized: Authentication credentials (e.g., Bearer JWT token) are missing or invalid.

403 Forbidden: The user is authenticated but does not have permission to access or modify the specified resource.

404 Not Found: The requested note ID or endpoint resource does not exist.

500 Internal Server Error: An unexpected server-side error occurred while processing the request.


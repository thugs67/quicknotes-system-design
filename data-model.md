Entity Definitions & Schema StructureusersColumns: user_id (INT), username (VARCHAR 50), email (VARCHAR 255), created_at (TIMESTAMP)
Primary Key: user_idForeign Keys: NonenotesColumns: note_id (INT), user_id (INT), title (VARCHAR 255), body (TEXT), created_at (TIMESTAMP)
Primary Key: note_idForeign Keys: user_id $\rightarrow$ references users(user_id)tagsColumns: tag_id (INT), name (VARCHAR 50), color_code (VARCHAR 7)
Primary Key: tag_idForeign Keys: Nonenote_tagsColumns: note_id (INT), tag_id (INT)
Primary Key: Composite key (note_id, tag_id)Foreign Keys:note_id $\rightarrow$ references notes(note_id)tag_id $\rightarrow$ references tags(tag_id)Entity Relationships ExplainedOne-to-Many (users to notes):
 A single user can create many notes, but each note belongs strictly to one user. This is implemented by placing user_id as a foreign key inside the notes table.Many-to-Many (notes to tags): 
 A single note can have many tags, and a single tag can be assigned to many notes. Relational databases cannot represent a direct many-to-many relationship in a single table without massive data duplication, so the note_tags junction table bridges them by holding pairs of foreign keys (note_id, tag_id).

 Reason: In a note-taking application, fetching all notes belonging to a logged-in user (WHERE user_id = ?) is the most frequent query operation. Indexing user_id on the notes table allows the database engine to locate a specific user's notes instantly via a B-tree search instead of scanning every single row in the entire notes table.

Database Selection Justification: SQL vs. NoSQL
A SQL (Relational) database is the optimal choice for QuickNotes. The application relies on highly structured, relational data (users owning notes, shared tags across notes) and requires strict referential integrity—such as cascading deletes when a user or note is removed.
 SQL native JOIN operations allow efficient tagging, searching, and filtering without data duplication.
 While NoSQL document stores can manage note objects well, handling reusable many-to-many tags across multiple users without creating duplicate tag documents or orphan references quickly introduces consistency risks that SQL handles natively out of the box.
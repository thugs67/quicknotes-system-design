// Constant API Endpoint URL
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// DOM Elements
const loadBtn = document.getElementById('load-btn');
const statusP = document.getElementById('status');
const noteForm = document.getElementById('note-form');
const titleInput =document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const submitBtn = document.getElementById('submit-btn');
const notesList = document.getElementById('notes-list');

// Internal state tracking
let isBusy = false;

/**
 * Reusable async fetch wrapper that checks response.ok and throws an error on failure.
 */
async function request(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  // Handle empty responses (e.g. 204 No Content or empty body)
  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Helper to update UI status messages safely.
 */
function setStatus(message, type = '') {
  if (!statusP) return;
  statusP.textContent = message;
  statusP.className = type; // Can be used in style.css for colors (e.g., 'loading', 'success', 'error')
}

/**
 * Toggle interactive state for action buttons during network requests.
 */
function setLoadingState(loading) {
  isBusy = loading;
  if (loadBtn) loadBtn.disabled = loading;
  if (submitBtn) submitBtn.disabled = loading;

  // Disable any dynamically rendered delete buttons during network requests
  if (notesList) {
    const deleteButtons = notesList.querySelectorAll('button');
    deleteButtons.forEach((btn) => (btn.disabled = loading));
  }
}

/**
 * Creates an LI DOM element for a note with title, body, and delete button.
 */
function createNoteElement(note) {
  const li = document.createElement('li');
  li.dataset.id = note.id;

  const titleEl = document.createElement('h3');
  titleEl.textContent = note.title;

  const bodyEl = document.createElement('p');
  bodyEl.textContent = note.body;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteNote(note.id, li));

  li.appendChild(titleEl);
  li.appendChild(bodyEl);
  li.appendChild(deleteBtn);

  return li;
}

/**
 * Safely renders the list of notes onto the page.
 */
function renderNotes(notes) {
  if (!notesList) return;
  notesList.textContent = ''; // Clear current items

  if (!notes || notes.length === 0) {
    setStatus('No notes found.', 'empty');
    return;
  }

  notes.forEach((note) => {
    const li = createNoteElement(note);
    notesList.appendChild(li);
  });
}

/**
 * GET: Load 10 notes from the API.
 */
async function loadNotes() {
  if (isBusy) return;

  setLoadingState(true);
  setStatus('Loading notes...', 'loading');

  try {
    const data = await request(`${API_URL}?_limit=10`);
    renderNotes(data);
    if (data && data.length > 0) {
      setStatus('Notes loaded successfully.', 'success');
    }
  } catch (error) {
    console.error('Error loading notes:', error);
    setStatus(`Failed to load notes: ${error.message}`, 'error');
  } finally {
    setLoadingState(false);
  }
}

/**
 * POST: Create a new note.
 */
async function createNote(event) {
  event.preventDefault();

  if (isBusy) return;

  const title = titleInput ? titleInput.value.trim() : '';
  const body = bodyInput ? bodyInput.value.trim() : '';

  // Client-side Validation
  if (!title) {
    setStatus('Validation Error: Title is required.', 'error');
    return;
  }

  if (title.length > 100) {
    setStatus(
      'Validation Error: Title must be 100 characters or less.',
      'error'
    );
    return;
  }

  if (!body) {
    setStatus('Validation Error: Note body is required.', 'error');
    return;
  }

  setLoadingState(true);
  setStatus('Saving note...', 'loading');

  try {
    const newNoteData = { title, body, userId: 1 };
    const createdNote = await request(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNoteData),
    });

    // Append created note to UI
    if (notesList) {
      const li = createNoteElement(createdNote);
      notesList.prepend(li);
    }

    // Reset Form inputs
    if (noteForm) {
      noteForm.reset();
    }
    setStatus('Note created successfully!', 'success');
  } catch (error) {
    console.error('Error creating note:', error);
    setStatus(`Failed to create note: ${error.message}`, 'error');
  } finally {
    setLoadingState(false);
  }
}

/**
 * DELETE: Remove a note by ID.
 */
async function deleteNote(id, element = null) {
  if (isBusy) return;

  setLoadingState(true);
  setStatus(`Deleting note #${id}...`, 'loading');

  try {
    await request(`${API_URL}/${id}`, {
      method: 'DELETE',
    });

    // Remove from UI (use direct element reference if available to handle mock ID collisions)
    const itemToRemove =
      element || (notesList && notesList.querySelector(`li[data-id="${id}"]`));
    if (itemToRemove) {
      itemToRemove.remove();
    }

    if (notesList && notesList.children.length === 0) {
      setStatus('No notes remaining.', 'empty');
    } else {
      setStatus(`Note #${id} deleted successfully.`, 'success');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    setStatus(`Failed to delete note: ${error.message}`, 'error');
  } finally {
    setLoadingState(false);
  }
}

// Event Listeners
if (loadBtn) {
  loadBtn.addEventListener('click', loadNotes);
}
if (noteForm) {
  noteForm.addEventListener('submit', createNote);
}
